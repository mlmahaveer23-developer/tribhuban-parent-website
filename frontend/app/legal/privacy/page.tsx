import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Tribhuban Concepts',
  description:
    'Tribhuban Concepts Privacy Policy — how we collect, use, store, and protect your personal data in compliance with the DPDP Act (India) and GDPR.',
  robots: { index: true, follow: true },
};

// Fully static — regenerated on deploy
export const revalidate = false;

export default function PrivacyPage() {
  return (
    <div className="container-content py-16">
      <article className="prose-content mx-auto">
        <h1 className="font-display text-4xl font-semibold text-page mb-2">Privacy Policy</h1>
        <p className="text-sm text-[var(--fg-muted)] mb-10">Last updated: June 2025</p>

        <div className="prose prose-stone max-w-none space-y-10">

          {/* 1. Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-page mt-0 mb-3">1. Introduction</h2>
            <p>
              Tribhuban Concepts (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to protecting your personal data.
              This Privacy Policy explains what information we collect when you visit{' '}
              <strong>tribhubanconcepts.com</strong>, how we use it, how long we keep it, and what
              rights you have over it. We operate primarily in India and comply with the{' '}
              <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> as well as
              applicable international data-protection standards including the GDPR where relevant.
            </p>
            <p>
              By using our website or submitting information through our forms, you acknowledge that
              you have read and understood this policy. If you do not agree, please discontinue use of
              our website.
            </p>
          </section>

          {/* 2. Data We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-page mb-3">2. Data We Collect</h2>
            <p>We collect the following categories of personal data:</p>
            <ul>
              <li>
                <strong>Identity and contact data</strong> — full name, email address, phone number,
                and optional company name, collected when you submit a contact form, book a
                consultation, apply for a job, or subscribe to our newsletter.
              </li>
              <li>
                <strong>Inquiry and project data</strong> — details of your interest area, message
                content, and any additional context you voluntarily provide.
              </li>
              <li>
                <strong>Technical and usage data</strong> — IP address, browser type and version,
                operating system, referring URL, pages visited, and time spent on pages. Collected
                automatically via server logs and, with your consent, via analytics tools.
              </li>
              <li>
                <strong>Marketing attribution data</strong> — UTM parameters, Google Click ID (gclid),
                Facebook Click ID (fbclid), referrer, and landing-page URL, collected to understand
                which marketing channels bring visitors to our site.
              </li>
              <li>
                <strong>Uploaded documents</strong> — resume files (PDF, DOC, DOCX, up to 5 MB)
                submitted as part of a job application, stored securely in AWS S3.
              </li>
              <li>
                <strong>Consent records</strong> — your consent choices (granted or denied), the
                categories consented to, and timestamps, stored to honour your preferences and fulfil
                our legal obligations.
              </li>
            </ul>
            <p>
              We do <strong>not</strong> collect sensitive personal data (such as financial account
              details, biometrics, health records, or government ID numbers) through this website.
            </p>
          </section>

          {/* 3. How We Use Your Data */}
          <section>
            <h2 className="text-2xl font-semibold text-page mb-3">3. How We Use Your Data</h2>
            <p>We use your personal data for the following purposes:</p>
            <ul>
              <li>To respond to enquiries and provide requested information about our services.</li>
              <li>To schedule and conduct consultations you have booked.</li>
              <li>To process and assess job applications.</li>
              <li>
                To send the newsletter and marketing communications — <strong>only</strong> where you
                have provided explicit consent.
              </li>
              <li>
                To improve our website and user experience through anonymised analytics (with consent).
              </li>
              <li>To detect, prevent, and respond to abuse, spam, or fraudulent submissions.</li>
              <li>To comply with our legal and regulatory obligations.</li>
              <li>
                To generate qualified leads and business pipeline for our sales process — we assign a
                score and quality band to inbound enquiries to prioritise follow-up.
              </li>
            </ul>
            <p>
              We do <strong>not</strong> sell, rent, or trade your personal data to third parties for
              their own marketing purposes.
            </p>
          </section>

          {/* 4. Data Storage and Security */}
          <section>
            <h2 className="text-2xl font-semibold text-page mb-3">4. Data Storage and Security</h2>
            <p>
              Your data is stored on servers located in <strong>India</strong> (or AWS regions that
              comply with Indian data-localisation requirements). We use industry-standard security
              measures including:
            </p>
            <ul>
              <li>TLS/HTTPS encryption for all data in transit.</li>
              <li>Encryption at rest for databases and file storage.</li>
              <li>Role-based access controls limiting who can view personal data.</li>
              <li>Regular security reviews and dependency updates.</li>
            </ul>
            <p>
              Despite these measures, no internet transmission or electronic storage is 100% secure.
              We encourage you to contact us immediately if you suspect any unauthorised access.
            </p>
            <p>
              We retain personal data only as long as necessary for the purpose it was collected or as
              required by law. Contact and consultation records are retained for up to{' '}
              <strong>3 years</strong> from the date of submission. Job applications are retained for
              up to <strong>1 year</strong> unless a longer period is required for a specific role.
              Newsletter subscriber data is retained until you unsubscribe.
            </p>
          </section>

          {/* 5. Consent */}
          <section>
            <h2 className="text-2xl font-semibold text-page mb-3">5. Consent</h2>
            <p>
              Where we rely on consent as the legal basis for processing (for example, sending
              marketing emails or loading analytics scripts), we will:
            </p>
            <ul>
              <li>Ask for your explicit, informed consent before processing begins.</li>
              <li>Record the consent timestamp, category, and IP address.</li>
              <li>Allow you to withdraw consent at any time without penalty.</li>
              <li>
                Honour browser <code>Do-Not-Track</code> signals as a default &ldquo;denied&rdquo; state until you
                explicitly grant consent.
              </li>
            </ul>
            <p>
              You can manage or withdraw your consent at any time using the cookie/consent preference
              controls on our website, or by contacting us directly.
            </p>
          </section>

          {/* 6. DPDP Act (India) Compliance */}
          <section>
            <h2 className="text-2xl font-semibold text-page mb-3">
              6. DPDP Act (India) Compliance
            </h2>
            <p>
              Under the <strong>Digital Personal Data Protection Act, 2023</strong>, you have the
              following rights as a Data Principal:
            </p>
            <ul>
              <li>
                <strong>Right to access</strong> — request a summary of your personal data we hold and
                the purposes for which it is processed.
              </li>
              <li>
                <strong>Right to correction and erasure</strong> — request that we correct inaccurate
                or incomplete data, or erase your data where it is no longer needed.
              </li>
              <li>
                <strong>Right to grievance redressal</strong> — raise a grievance and receive a
                response within the timeframe stipulated by the DPDP Act.
              </li>
              <li>
                <strong>Right to nominate</strong> — nominate another individual to exercise your
                rights in the event of your death or incapacity.
              </li>
              <li>
                <strong>Right to withdraw consent</strong> — withdraw consent at any time; withdrawal
                does not affect the lawfulness of processing carried out before withdrawal.
              </li>
            </ul>
            <p>
              We act as the <strong>Data Fiduciary</strong> for data collected on this website. We do
              not currently employ a Data Processor relationship for personal data handling beyond
              standard cloud infrastructure.
            </p>
            <p>
              Cross-border data transfers, if any, are conducted only to countries or territories
              notified by the Indian government as providing an adequate level of data protection.
            </p>
          </section>

          {/* 7. Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-semibold text-page mb-3">7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to operate our website and, with your consent, to
              analyse usage and personalise content. For full details, see our{' '}
              <a href="/legal/cookies" className="text-[var(--accent)] hover:underline">
                Cookie Policy
              </a>
              .
            </p>
            <p>
              No third-party analytics, session-replay, or marketing scripts are loaded until you have
              explicitly granted consent through our cookie consent banner.
            </p>
          </section>

          {/* 8. Contact for Data Requests */}
          <section>
            <h2 className="text-2xl font-semibold text-page mb-3">8. Contact for Data Requests</h2>
            <p>
              To exercise any of your rights, raise a grievance, or ask questions about this Privacy
              Policy, please contact our data team:
            </p>
            <address className="not-italic mt-4 space-y-1 text-[var(--fg-muted)]">
              <p>
                <strong>Tribhuban Concepts — Data Privacy</strong>
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
              We will respond to verifiable data requests within <strong>30 days</strong> of receipt,
              or within the timeframe required by applicable law.
            </p>
          </section>

        </div>
      </article>
    </div>
  );
}
