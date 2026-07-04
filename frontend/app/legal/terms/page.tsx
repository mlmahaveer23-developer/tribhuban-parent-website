import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Tribhuban Concepts',
  description:
    'Tribhuban Concepts Terms of Service — the rules and conditions for using our website and services, governed by Indian law.',
  robots: { index: true, follow: true },
};

// Fully static — regenerated on deploy
export const revalidate = false;

export default function TermsPage() {
  return (
    <div className="container-content py-16">
      <article className="prose-content mx-auto">
        <h1 className="font-display text-4xl font-semibold text-page mb-2">Terms of Service</h1>
        <p className="text-sm text-[var(--fg-muted)] mb-10">Last updated: June 2025</p>

        <div className="prose prose-stone max-w-none space-y-10">

          {/* 1. Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-page mt-0 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using <strong>tribhubanconcepts.com</strong> (the &ldquo;Website&rdquo;), operated
              by Tribhuban Concepts (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), you agree to be bound by these Terms of
              Service (&ldquo;Terms&rdquo;). If you do not agree to all of these Terms, you must not use the
              Website.
            </p>
            <p>
              We may update these Terms from time to time. Continued use of the Website after any
              changes constitutes acceptance of the revised Terms. We will indicate the date of the
              most recent revision at the top of this page.
            </p>
          </section>

          {/* 2. Permitted Use */}
          <section>
            <h2 className="text-2xl font-semibold text-page mb-3">2. Permitted Use</h2>
            <p>You may use the Website for lawful purposes only. You agree that you will not:</p>
            <ul>
              <li>
                Use the Website in any way that violates applicable Indian or international laws or
                regulations.
              </li>
              <li>
                Submit false, misleading, or fraudulent information through any form on the Website.
              </li>
              <li>
                Attempt to gain unauthorised access to any part of the Website, its servers, or any
                related systems or networks.
              </li>
              <li>
                Use automated tools (bots, scrapers, crawlers) to collect data from the Website in a
                manner that adversely affects performance or circumvents rate limits — except for
                search-engine crawlers explicitly permitted in our <code>robots.txt</code>.
              </li>
              <li>
                Transmit any material that is harmful, offensive, defamatory, or infringes any
                intellectual-property rights.
              </li>
              <li>
                Attempt to reverse-engineer, decompile, or disassemble any software or underlying
                technology of the Website.
              </li>
            </ul>
            <p>
              We reserve the right to refuse service, terminate access, or take legal action against
              anyone who violates these Terms.
            </p>
          </section>

          {/* 3. Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-page mb-3">3. Intellectual Property</h2>
            <p>
              All content on this Website — including but not limited to text, articles, graphics,
              logos, icons, images, audio clips, and software — is the exclusive property of Tribhuban
              Concepts or its content suppliers and is protected by Indian copyright law and
              international copyright treaties.
            </p>
            <p>
              You may view, download, and print content from this Website for your personal,
              non-commercial use only, provided you do not modify the content and retain all copyright
              and proprietary notices.
            </p>
            <p>
              No content may be reproduced, distributed, publicly displayed, or used to create
              derivative works without our prior written permission. The Tribhuban Concepts name,
              logo, and all associated marks are trademarks of Tribhuban Concepts and may not be used
              without explicit written authorisation.
            </p>
          </section>

          {/* 4. Disclaimers */}
          <section>
            <h2 className="text-2xl font-semibold text-page mb-3">4. Disclaimers</h2>
            <p>
              The Website and its content are provided on an{' '}
              <strong>&ldquo;as is&rdquo; and &ldquo;as available&rdquo;</strong>{' '}
              basis without warranties of any kind, whether express or implied, including but not
              limited to implied warranties of merchantability, fitness for a particular purpose, or
              non-infringement.
            </p>
            <p>
              The solar savings estimates generated by our Solar Calculator are{' '}
              <strong>indicative only</strong>. Actual savings will depend on site-specific factors
              including but not limited to roof orientation, shading, local grid tariffs, and system
              performance. Estimates do not constitute a quote, guarantee, or engineering assessment.
              You should obtain a professional site survey before making financial decisions.
            </p>
            <p>
              We do not warrant that the Website will be uninterrupted, error-free, free of viruses,
              or that defects will be corrected. We reserve the right to modify, suspend, or
              discontinue any part of the Website at any time without notice.
            </p>
          </section>

          {/* 5. Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-page mb-3">5. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable Indian law, Tribhuban Concepts shall not be
              liable for any indirect, incidental, special, consequential, or punitive damages arising
              out of or in connection with your use of the Website or these Terms, even if we have been
              advised of the possibility of such damages.
            </p>
            <p>
              Our total aggregate liability to you for any claim arising from or related to the Website
              shall not exceed the amount you paid, if any, to access the Website or services in the
              twelve (12) months preceding the claim.
            </p>
            <p>
              Some jurisdictions do not allow the exclusion or limitation of certain warranties or
              liabilities; in such jurisdictions, our liability is limited to the greatest extent
              permitted by law.
            </p>
          </section>

          {/* 6. Governing Law and Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-page mb-3">6. Governing Law and Contact</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of{' '}
              <strong>India</strong>, without regard to conflict-of-law principles. Any dispute arising
              from these Terms or your use of the Website shall be subject to the exclusive
              jurisdiction of the courts located in India.
            </p>
            <p>
              If you have any questions about these Terms or wish to seek permission for uses not
              covered above, please contact us:
            </p>
            <address className="not-italic mt-4 space-y-1 text-[var(--fg-muted)]">
              <p>
                <strong>Tribhuban Concepts — Legal</strong>
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
          </section>

        </div>
      </article>
    </div>
  );
}
