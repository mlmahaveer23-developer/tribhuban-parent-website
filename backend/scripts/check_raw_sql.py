#!/usr/bin/env python3
"""
CI lint check: detect raw SQL string construction.

Scans Python source files for patterns that indicate raw SQL strings are being
built by concatenation or f-string interpolation, which can introduce SQL
injection vulnerabilities.

All SQLAlchemy queries MUST use bound parameters (SQLAlchemy Core expressions,
ORM queries, or `text()` with `:param` placeholders).  Raw SQL construction
like `f"SELECT ... WHERE id = {value}"` or `"SELECT ... WHERE id = " + value`
is explicitly prohibited.

Exit codes:
  0  — no violations found
  1  — violations found (fails CI)

Usage:
  python scripts/check_raw_sql.py
  python scripts/check_raw_sql.py app/repositories

Exclusions:
  - Migration files (alembic/versions/) — they use explicit DDL which is
    author-controlled and not parameterized with user input.
  - This script itself.
  - Test files that test the checker itself.
  - Lines that contain `# noqa: raw-sql` or `# nosec` comments.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

# ── Detection patterns ────────────────────────────────────────────────────────
#
# We look for:
#   1. f-strings that contain SQL keywords:
#        f"SELECT ... {var}"   f"INSERT ... {var}"   f"WHERE {col} ="
#   2. String concatenation with SQL keywords on one side:
#        "SELECT * FROM " + table_name
#        "WHERE id = " + str(user_id)
#   3. % formatting on SQL strings:
#        "SELECT * FROM %s" % table
#        "WHERE id = %s" % user_id   — only flag when the format arg is a
#         variable (not a literal), as positional %s with execute() is OK.
#   4. .format() calls on SQL strings:
#        "SELECT ... WHERE id = {}".format(x)
#   5. Direct text() with f-strings:
#        text(f"SELECT ... WHERE id = {x}")

# Keywords that indicate a string is likely SQL
_SQL_KEYWORDS = r"(?:SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TRUNCATE|WHERE|FROM|JOIN|INTO|VALUES|SET)\s"

_PATTERNS: list[re.Pattern[str]] = [
    # f-string with SQL keyword and a brace expression
    re.compile(
        rf'f["\'].*{_SQL_KEYWORDS}.*\{{[^{{}}]+\}}.*["\']',
        re.IGNORECASE,
    ),
    re.compile(
        rf'f""".*{_SQL_KEYWORDS}.*\{{[^{{}}]+\}}.*"""',
        re.IGNORECASE | re.DOTALL,
    ),
    # String concatenation: SQL string + variable  OR  variable + SQL string
    re.compile(
        rf'["\'].*{_SQL_KEYWORDS}.*["\'\s]\s*\+\s*\w',
        re.IGNORECASE,
    ),
    re.compile(
        rf'\w\s*\+\s*["\'].*{_SQL_KEYWORDS}.*["\']',
        re.IGNORECASE,
    ),
    # .format() on a SQL string
    re.compile(
        rf'["\'].*{_SQL_KEYWORDS}.*["\']\.format\s*\(',
        re.IGNORECASE,
    ),
    # % formatting where the format string contains SQL keyword
    re.compile(
        rf'["\'].*{_SQL_KEYWORDS}.*["\'\s]*%\s*[\w(]',
        re.IGNORECASE,
    ),
    # text() / execute() with an f-string argument
    re.compile(
        r'(?:text|execute)\s*\(\s*f["\']',
        re.IGNORECASE,
    ),
]

# Lines containing these comments are explicitly whitelisted
_NOSEC_COMMENT = re.compile(r'#\s*(?:noqa:\s*raw-sql|nosec|noqa:.*raw-sql)', re.IGNORECASE)

# Directories/files to always exclude
_EXCLUDED_PATHS: frozenset[str] = frozenset(
    {
        "migrations",
        "alembic",
        "scripts/check_raw_sql.py",
        "__pycache__",
        ".venv",
        "venv",
        "env",
        "node_modules",
    }
)


# ── Helpers ───────────────────────────────────────────────────────────────────


def _should_skip_path(path: Path) -> bool:
    parts = set(path.parts)
    return bool(parts & _EXCLUDED_PATHS) or any(
        excl in str(path) for excl in _EXCLUDED_PATHS
    )


def _check_file(path: Path) -> list[tuple[int, str]]:
    """Return list of (line_number, line_content) tuples with violations."""
    violations: list[tuple[int, str]] = []
    try:
        source = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return violations

    for lineno, line in enumerate(source.splitlines(), start=1):
        stripped = line.strip()
        # Skip blank lines and comments
        if not stripped or stripped.startswith("#"):
            continue
        # Skip whitelisted lines
        if _NOSEC_COMMENT.search(line):
            continue
        # Check all patterns
        for pattern in _PATTERNS:
            if pattern.search(line):
                violations.append((lineno, line.rstrip()))
                break  # Only report each line once

    return violations


# ── Main ──────────────────────────────────────────────────────────────────────


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Check for raw SQL string construction in Python source files."
    )
    parser.add_argument(
        "paths",
        nargs="*",
        default=["app"],
        help="Directories or files to scan (default: app/)",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Show all scanned files, not just violations",
    )
    args = parser.parse_args()

    all_violations: list[tuple[Path, int, str]] = []
    scanned = 0

    for root_str in args.paths:
        root = Path(root_str)
        if root.is_file():
            candidates = [root] if root.suffix == ".py" else []
        else:
            candidates = list(root.rglob("*.py"))

        for path in sorted(candidates):
            if _should_skip_path(path):
                continue
            scanned += 1
            if args.verbose:
                print(f"  scanning {path}")
            file_violations = _check_file(path)
            for lineno, line in file_violations:
                all_violations.append((path, lineno, line))

    # ── Report ────────────────────────────────────────────────────────────────
    print(f"\nRaw SQL lint check — scanned {scanned} file(s)")

    if not all_violations:
        print("✓ No raw SQL string construction detected.")
        return 0

    print(f"\n✗ Found {len(all_violations)} potential raw SQL string construction(s):\n")
    for file_path, lineno, line in all_violations:
        print(f"  {file_path}:{lineno}")
        print(f"    {line}")
        print()

    print(
        "All SQLAlchemy queries must use bound parameters.\n"
        "Use SQLAlchemy ORM/Core expressions or text() with :named_param placeholders.\n"
        "To suppress a false positive, add  # noqa: raw-sql  to the end of the line."
    )
    return 1


if __name__ == "__main__":
    sys.exit(main())
