import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy — Tribhuban Concepts',
  description:
    'Tribhuban Concepts Cookie Policy — how we use cookies and similar tracking technologies, and how you can control them.',
  robots: { index: true, follow: true },
};

// Fully static — regenerated on deploy
export const revalidate = false;

export default function CookiesPage() {
  return (
    <div className="container-content py-16">
      <article className="prose-content mx-auto">
        <h1 className="font-display text-4xl font-semibold text-page mb-2">Cookie Policy</h1>
        <p className="text-sm text-[var(--fg-muted)] mb-10">Last updated: June 2025</p>

        <div className="prose prose-stone max-w-none space-y-10">

          {/* 1. What Are Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-page mt-0 mb-3">1. What Are Cookies</h2>
            <p>
              Cookies are small text files that are placed on your device (computer, smartphone, or
              tablet) when you visit a website. They are widely used to make websites work more
              efficiently, to remember your preferences, and to provide information to website owners.
            </p>
            <p>
              In addition to cookies, we may also use similar technologies such as{' '}
              <strong>web beacons</strong>, <strong>pixel tags</strong>, and{' '}
              <strong>local storage</strong> for similar purposes. This policy covers all such
              technologies collectively referred to as &ldquo;cookies&rdquo;.
            </p>
          </section>

          {/* 2. Types of Cookies We Use */}
          <section>
            <h2 className="text-2xl font-semibold text-page mb-3">2. Types of Cookies We Use</h2>
            <p>We categorise the cookies we use as follows:</p>

            <h3 className="text-lg font-semibold text-page mt-6 mb-2">
              Strictly Necessary Cookies
            </h3>
            <p>
              These cookies are essential for the Website to function. They do not collect information
              about you for marketing purposes and cannot be switched off. Examples include cookies
              that remember your consent preferences and security tokens. No consent is required for
              these cookies.
            </p>

            <h3 className="text-lg font-semibold text-page mt-6 mb-2">Analytics Cookies</h3>
            <p>
              With your consent, we use analytics tools (including Google Analytics 4, PostHog, and
              Microsoft Clarity) to understand how visitors interact with our Website — which pages are
              popular, how long people stay, and where they come from. This helps us improve content
              and user experience. All analytics data is aggregated and anonymised where possible.
            </p>

            <h3 className="text-lg font-semibold text-page mt-6 mb-2">Marketing Cookies</h3>
            <p>
              With your consent, we may use marketing cookies to track effectiveness of advertising
              campaigns and to show relevant content. These include cookies set by Google (gclid),
              Meta (fbclid), and similar advertising platforms. We do not use these cookies to build
              profiles for sale to third parties.
            </p>

            <h3 className="text-lg font-semibold text-page mt-6 mb-2">Preference Cookies</h3>
            <p>
              These cookies remember choices you make to improve your experience — for example, your
              preferred colour theme (light or dark mode). Stored in <code>localStorage</code>, not
              transmitted to our servers.
            </p>
          </section>

          {/* 3. How to Control Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-page mb-3">3. How to Control Cookies</h2>
            <p>You have several options for controlling cookies:</p>
            <ul>
              <li>
                <strong>Our consent banner</strong> — when you first visit the Website, you will see a
                consent banner where you can accept or decline non-essential cookies by category. You
                can revisit and change your preferences at any time using the cookie settings link in
                our footer.
              </li>
              <li>
                <strong>Browser settings</strong> — most browsers allow you to block or delete cookies
                through their settings. Refer to your browser&apos;s help documentation for instructions.
                Note that blocking all cookies may affect Website functionality.
              </li>
              <li>
                <strong>Do Not Track</strong> — if your browser sends a <code>Do-Not-Track: 1</code>{' '}
                signal, we treat this as a denial of consent for analytics and marketing cookies unless
                you subsequently grant explicit consent.
              </li>
              <li>
                <strong>Opt-out tools</strong> — you can opt out of Google Analytics tracking via the{' '}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] hover:underline"
                >
                  Google Analytics Opt-out Browser Add-on
                </a>
                .
              </li>
            </ul>
            <p>
              We do not load any analytics, session-replay, or marketing scripts until you have
              explicitly granted consent through our banner.
            </p>
          </section>

          {/* 4. Third-Party Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-page mb-3">4. Third-Party Cookies</h2>
            <p>
              Some cookies on our Website are set by third-party services we use, subject to your
              consent. These third parties have their own privacy policies governing how they use the
              information they collect. Key third-party services include:
            </p>
            <ul>
              <li>
                <strong>Google Analytics 4</strong> — web analytics. See{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] hover:underline"
                >
                  Google Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>PostHog</strong> — product analytics and session recording. See{' '}
                <a
                  href="https://posthog.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] hover:underline"
                >
                  PostHog Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Microsoft Clarity</strong> — heatmaps and session recordings. See{' '}
                <a
                  href="https://privacy.microsoft.com/privacystatement"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] hover:underline"
                >
                  Microsoft Privacy Statement
                </a>
                .
              </li>
              <li>
                <strong>Cloudflare Turnstile</strong> — bot and spam detection (used on forms). This
                is a strictly necessary technology. See{' '}
                <a
                  href="https://www.cloudflare.com/privacypolicy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] hover:underline"
                >
                  Cloudflare Privacy Policy
                </a>
                .
              </li>
            </ul>
            <p>
              We are not responsible for the content or privacy practices of these third-party websites
              or services.
            </p>
          </section>

          {/* 5. Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-page mb-3">5. Contact Us</h2>
            <p>
              If you have questions about how we use cookies or wish to exercise your rights under the
              DPDP Act or GDPR in relation to cookie data, please contact us:
            </p>
            <address className="not-italic mt-4 space-y-1 text-[var(--fg-muted)]">
              <p>
                <strong>Tribhuban Concepts — Privacy</strong>
              </p>
              <p>
                Email:{' '}
                <a
                  href="mailto:hello@tribhubanconcepts.com"
                  className="text-[var(--accent)] hover:underline"
                >
                  hello@tribhubanconcepts.com
                </a>
              </p>
              <p>India</p>
            </address>
            <p className="mt-4">
              For general privacy enquiries, please also refer to our{' '}
              <a href="/legal/privacy" className="text-[var(--accent)] hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </section>

        </div>
      </article>
    </div>
  );
}
