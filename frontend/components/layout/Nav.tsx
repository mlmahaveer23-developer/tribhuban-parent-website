'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import MegaMenu from './MegaMenu';

/* ─────────────────────────────────────────────────────────────────────────────
   Non-Solar primary nav items
───────────────────────────────────────────────────────────────────────────── */
const navItems = [
  { label: 'Products', href: '/products' },
  { label: 'Future Technologies', href: '/future-technologies' },
  { label: 'Knowledge', href: '/knowledge' },
  { label: 'Blog', href: '/blog' },
  { label: 'Company', href: '/about' },
] as const;

/* ─────────────────────────────────────────────────────────────────────────────
   Nav — desktop primary navigation.
   Renders as a semantic <nav> with <ul>. Solar item uses MegaMenu.
   Current page highlighted via usePathname(). "use client" for hooks.
───────────────────────────────────────────────────────────────────────────── */
export default function Nav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation">
      <ul className="flex items-center gap-1 list-none m-0 p-0">
        {/* Solar — MegaMenu item */}
        <li>
          <MegaMenu />
        </li>

        {/* Other primary nav items */}
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center px-3 py-2 rounded-sm',
                  'text-sm font-medium transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
                  'focus-visible:ring-offset-[var(--bg)]',
                  isActive
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--fg)] hover:text-[var(--accent)] hover:bg-[var(--bg-muted)]',
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
