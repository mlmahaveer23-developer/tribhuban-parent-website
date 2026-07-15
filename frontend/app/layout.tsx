import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ConsentBanner from '@/components/layout/ConsentBanner';
import { AuthProvider } from '@/contexts/AuthContext';

/* ─────────────────────────────────────────────────────────────────────────────
   Fonts — self-hosted via next/font, display: swap, subsets for CWV.
   CSS variables: --font-display (Playfair Display) and --font-sans (Inter).
───────────────────────────────────────────────────────────────────────────── */
const displayFont = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const sansFont = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

/* ─────────────────────────────────────────────────────────────────────────────
   Root Metadata
───────────────────────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tribhuban-parent-website.vercel.app'),
  title: {
    default: 'Tribhuban Concepts — Technology That Reaches Everywhere',
    template: '%s — Tribhuban Concepts',
  },
  description:
    'Tribhuban Concepts is an Indian technology and engineering company specialising in solar energy, future technologies, and engineering excellence.',
  openGraph: {
    type: 'website',
    siteName: 'Tribhuban Concepts',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tribhuban-parent-website.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tribhubanconcepts',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Pre-hydration theme script
   Reads localStorage and prefers-color-scheme; applies .dark class to <html>
   BEFORE React hydrates — prevents flash of wrong theme (FOUC).
   This is an inline script inserted directly in <head> as a blocking script.
───────────────────────────────────────────────────────────────────────────── */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored === 'dark' || (!stored && prefersDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (e) {}
})();
`.trim();

/* ─────────────────────────────────────────────────────────────────────────────
   Root Layout
───────────────────────────────────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /*
     * suppressHydrationWarning: prevents React from warning about the
     * class/data-theme attribute set by the pre-hydration inline script.
     */
    <html
      lang="en"
      suppressHydrationWarning
      className={`${displayFont.variable} ${sansFont.variable}`}
    >
      <head>
        {/*
          Pre-hydration theme script: runs synchronously before React renders.
          suppressHydrationWarning on <html> prevents React from complaining
          about the class/data-theme attribute set by this script.
        */}
        <script
          dangerouslySetInnerHTML={{ __html: themeScript }}
          suppressHydrationWarning
        />
      </head>
      <body className="flex flex-col min-h-screen bg-page text-page font-sans antialiased">
        {/* Skip to main content — accessibility: visible on focus */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>

        <AuthProvider>
          {/* Consent banner — client component, returns null until task 18.1 */}
          <ConsentBanner />

          {/* Global header with sticky nav */}
          <Header />

          {/* Single <main> landmark — pages render their content here */}
          <main id="main-content" role="main" className="flex-1">
            {children}
          </main>

          {/* Global footer */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
