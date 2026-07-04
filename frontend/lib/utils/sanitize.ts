/**
 * HTML sanitization helpers backed by DOMPurify.
 *
 * All user-supplied HTML that reaches `dangerouslySetInnerHTML` MUST be
 * passed through one of these helpers first to prevent XSS injection.
 *
 * Usage:
 *   // Unsafe — never do this:
 *   <div dangerouslySetInnerHTML={{ __html: userContent }} />
 *
 *   // Safe — always do this:
 *   import { sanitizeHtml, sanitizeInlineHtml } from '@/lib/utils/sanitize';
 *   <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userContent) }} />
 *
 * Two profiles are provided:
 *   sanitizeHtml()        — rich content (article body): block elements, links,
 *                           images, lists, headings, code blocks, tables.
 *   sanitizeInlineHtml()  — inline content (FAQ answers, descriptions):
 *                           only inline elements (b, i, em, strong, a, code, br).
 *
 * Server components:
 *   DOMPurify requires a DOM; the helpers automatically fall back to a
 *   plain-text strip on the server.
 *
 * JSON-LD scripts and theme scripts do NOT need sanitization — their content
 * is always `JSON.stringify(obj)` or a hardcoded template string from source,
 * never derived from user input.  Attempting to sanitize JSON-LD would corrupt
 * the structured data.
 */

'use client';

import DOMPurify from 'dompurify';
import type { Config } from 'dompurify';

// ── Allowed tag / attribute profiles ─────────────────────────────────────────

/**
 * Tags and attributes safe for rich editorial content.
 * Covers article bodies, knowledge-center items, FAQ answers, and blog posts.
 */
const RICH_ALLOWED_TAGS: string[] = [
  // Block structure
  'p', 'div', 'section', 'article', 'aside', 'blockquote', 'pre',
  // Headings
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // Lists
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  // Inline
  'a', 'b', 'i', 'em', 'strong', 'small', 'span', 'code', 'kbd', 'mark',
  'del', 'ins', 's', 'sub', 'sup', 'abbr', 'cite', 'q', 'br', 'hr',
  // Media
  'img', 'figure', 'figcaption',
  // Table
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  // Code / details
  'details', 'summary',
];

const RICH_ALLOWED_ATTR: string[] = [
  'href', 'rel', 'target',
  'src', 'srcset', 'alt', 'width', 'height', 'loading',
  'aria-label', 'aria-describedby', 'aria-hidden', 'role', 'id',
  'title', 'lang', 'dir',
  'colspan', 'rowspan', 'scope', 'headers',
  'class', 'open',
];

/**
 * Tags and attributes safe for inline content only.
 * Suitable for short descriptions, labels, and FAQ answers.
 */
const INLINE_ALLOWED_TAGS: string[] = [
  'a', 'b', 'i', 'em', 'strong', 'small', 'span', 'code', 'kbd',
  'mark', 'del', 'ins', 's', 'sub', 'sup', 'abbr', 'cite', 'q', 'br',
];

const INLINE_ALLOWED_ATTR: string[] = [
  'href', 'rel', 'target', 'title', 'aria-label', 'class',
];

// ── Dangerous event attributes to always forbid ───────────────────────────────
const FORBID_ATTR: string[] = [
  'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus',
  'onblur', 'onchange', 'onsubmit', 'onkeydown', 'onkeyup',
  'onkeypress', 'onmouseenter', 'onmouseleave',
];

const FORBID_CONTENTS: string[] = [
  'script', 'style', 'iframe', 'object', 'embed', 'form',
];

// ── URL safety ────────────────────────────────────────────────────────────────

const SAFE_URL_RE = /^(?:https?|mailto|tel):/i;

/**
 * Register a DOMPurify afterSanitizeAttributes hook that removes unsafe
 * protocols from href/src and forces external links to open safely.
 *
 * The hook is registered once per purify instance; repeated calls are
 * idempotent because we only register when the hook is not yet present.
 */
let _urlHookRegistered = false;

function _ensureUrlHook(): void {
  if (_urlHookRegistered) return;
  _urlHookRegistered = true;

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    const el = node as HTMLElement;

    // Enforce safe hrefs
    if (el.hasAttribute('href')) {
      const href = el.getAttribute('href') ?? '';
      const isRelative =
        href.startsWith('/') || href.startsWith('.') || href.startsWith('#');
      if (href && !isRelative && !SAFE_URL_RE.test(href)) {
        el.removeAttribute('href');
      } else if (SAFE_URL_RE.test(href)) {
        // External absolute URL — force safe cross-origin opening
        el.setAttribute('rel', 'noopener noreferrer');
        el.setAttribute('target', '_blank');
      }
    }

    // Enforce safe src
    if (el.hasAttribute('src')) {
      const src = el.getAttribute('src') ?? '';
      const isRelative = src.startsWith('/') || src.startsWith('.');
      if (src && !isRelative && !SAFE_URL_RE.test(src)) {
        el.removeAttribute('src');
      }
    }
  });
}

// ── Shared sanitize config builder ───────────────────────────────────────────

function _buildConfig(
  allowedTags: string[],
  allowedAttr: string[],
): Config {
  return {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttr,
    FORBID_CONTENTS,
    FORBID_ATTR,
    FORCE_BODY: false,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Sanitize user-supplied HTML for use in rich editorial contexts.
 *
 * Returns a string safe to pass to `dangerouslySetInnerHTML={{ __html: ... }}`.
 *
 * MUST be called from a Client Component or guarded by `typeof window !== 'undefined'`.
 *
 * @param dirty  Raw HTML string from user input, CMS, or API response.
 * @returns      Sanitized HTML string.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';
  if (typeof window === 'undefined') {
    return stripAllTags(dirty);
  }
  _ensureUrlHook();
  return DOMPurify.sanitize(dirty, _buildConfig(RICH_ALLOWED_TAGS, RICH_ALLOWED_ATTR));
}

/**
 * Sanitize user-supplied HTML for use in inline contexts.
 *
 * Allows only inline formatting elements (bold, italic, links, code, etc.).
 * No block elements, no images, no tables.
 *
 * @param dirty  Raw HTML string from user input.
 * @returns      Sanitized inline HTML string.
 */
export function sanitizeInlineHtml(dirty: string): string {
  if (!dirty) return '';
  if (typeof window === 'undefined') {
    return stripAllTags(dirty);
  }
  _ensureUrlHook();
  return DOMPurify.sanitize(dirty, _buildConfig(INLINE_ALLOWED_TAGS, INLINE_ALLOWED_ATTR));
}

/**
 * Strip all HTML tags, returning plain text only.
 *
 * Used as a server-side fallback when DOMPurify is unavailable, and as a
 * utility for contexts where only plain text is needed (e.g. aria-label,
 * meta descriptions, email subjects).
 *
 * @param dirty  String potentially containing HTML tags.
 * @returns      Plain text with all tags removed.
 */
export function stripAllTags(dirty: string): string {
  if (!dirty) return '';
  return dirty
    .replace(/<\/(?:p|div|li|br|h[1-6]|tr|td|th|blockquote|pre)[^>]*>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Returns props safe for use with `dangerouslySetInnerHTML` in rich content.
 *
 * @example
 * ```tsx
 * import { dangerousHtml } from '@/lib/utils/sanitize';
 * <div {...dangerousHtml(userContent)} />
 * ```
 */
export function dangerousHtml(
  dirty: string,
): { dangerouslySetInnerHTML: { __html: string } } {
  return { dangerouslySetInnerHTML: { __html: sanitizeHtml(dirty) } };
}

/**
 * Returns props safe for use with `dangerouslySetInnerHTML` in inline contexts.
 *
 * @example
 * ```tsx
 * import { dangerousInlineHtml } from '@/lib/utils/sanitize';
 * <span {...dangerousInlineHtml(userDescription)} />
 * ```
 */
export function dangerousInlineHtml(
  dirty: string,
): { dangerouslySetInnerHTML: { __html: string } } {
  return { dangerouslySetInnerHTML: { __html: sanitizeInlineHtml(dirty) } };
}
