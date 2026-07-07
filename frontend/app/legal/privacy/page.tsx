import type { Metadata } from 'next';
import LegalPage, { legal } from '@/components/layout/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy — Tribhuban Concepts',
  description: 'How Tribhuban Concepts collects, uses, stores, and protects your personal data in compliance with the DPDP Act (India) and GDPR.',
  robots: { index: true, follow: true },
};

export const revalidate = false;

export default function PrivacyPage() {
  const sections = [
    {
      id: 'introduction', number: '1', title: 'Introduction',
      content: (
        <>
          <p className={legal.p}>Tribhuban Concepts (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to protecting your personal data. This Privacy Policy explains what information we collect when you visit <strong>tribhubanconcepts.com</strong>, how we use it, how long we keep it, and what rights you have over it.</p>
          <p className={legal.p}>We operate primarily in India and comply with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> as well as applicable international data-protection standards including the GDPR where relevant.</p>
          <p className={legal.p}>By using our website or submitting information through our forms, you acknowledge that you have read and understood this policy.</p>
        </>
      ),
    },
    {
      id: 'data-collected', number: '2', title: 'Data We Collect',
      content: (
        <>
          <p className={legal.p}>We collect the following categories of personal data:</p>
          <ul className={legal.ul}>
            <li className={legal.li}><strong>Identity and contact data</strong> — full name, email address, phone number, and optional company name, collected when you submit a contact form, book a consultation, apply for a job, or subscribe to our newsletter.</li>
            <li className={legal.li}><strong>Inquiry and project data</strong> — details of your interest area, message content, and any additional context you voluntarily provide.</li>
            <li className={legal.li}><strong>Technical and usage data</strong> — IP address, browser type and version, operating system, referring URL, pages visited, and time spent on pages. Collected automatically via server logs and, with your consent, via analytics tools.</li>
            <li className={legal.li}><strong>Marketing attribution data</strong> — UTM parameters, Google Click ID (gclid), Facebook Click ID (fbclid), referrer, and landing-page URL.</li>
            <li className={legal.li}><strong>Uploaded documents</strong> — resume files (PDF, DOC, DOCX, up to 5 MB) submitted as part of a job application, stored securely in AWS S3.</li>
            <li className={legal.li}><strong>Consent records</strong> — your consent choices (granted or denied), the categories consented to, and timestamps.</li>
          </ul>
          <p className={legal.p}>We do <strong>not</strong> collect sensitive personal data such as financial account details, biometrics, health records, or government ID numbers through this website.</p>
        </>
      ),
    },
    {
      id: 'how-we-use', number: '3', title: 'How We Use Your Data',
      content: (
        <>
          <p className={legal.p}>We use your personal data for the following purposes:</p>
          <ul className={legal.ul}>
            <li className={legal.li}>To respond to enquiries and provide requested information about our services.</li>
            <li className={legal.li}>To schedule and conduct consultations you have booked.</li>
            <li className={legal.li}>To process and assess job applications.</li>
            <li className={legal.li}>To send the newsletter and marketing communications — <strong>only</strong> where you have provided explicit consent.</li>
            <li className={legal.li}>To improve our website and user experience through anonymised analytics (with consent).</li>
            <li className={legal.li}>To detect, prevent, and respond to abuse, spam, or fraudulent submissions.</li>
            <li className={legal.li}>To comply with our legal and regulatory obligations.</li>
          </ul>
          <p className={legal.p}>We do <strong>not</strong> sell, rent, or trade your personal data to third parties for their own marketing purposes.</p>
        </>
      ),
    },
    {
      id: 'storage-security', number: '4', title: 'Data Storage and Security',
      content: (
        <>
          <p className={legal.p}>Your data is stored on servers located in <strong>India</strong> (or AWS regions that comply with Indian data-localisation requirements). We use industry-standard security measures including:</p>
          <ul className={legal.ul}>
            <li className={legal.li}>TLS/HTTPS encryption for all data in transit.</li>
            <li className={legal.li}>Encryption at rest for databases and file storage.</li>
            <li className={legal.li}>Role-based access controls limiting who can view personal data.</li>
            <li className={legal.li}>Regular security reviews and dependency updates.</li>
          </ul>
          <p className={legal.p}>We retain personal data only as long as necessary for the purpose it was collected or as required by law. Contact and consultation records are retained for up to <strong>3 years</strong>. Job applications are retained for up to <strong>1 year</strong>. Newsletter subscriber data is retained until you unsubscribe.</p>
        </>
      ),
    },
    {
      id: 'consent', number: '5', title: 'Consent',
      content: (
        <>
          <p className={legal.p}>Where we rely on consent as the legal basis for processing, we will:</p>
          <ul className={legal.ul}>
            <li className={legal.li}>Ask for your explicit, informed consent before processing begins.</li>
            <li className={legal.li}>Record the consent timestamp, category, and IP address.</li>
            <li className={legal.li}>Allow you to withdraw consent at any time without penalty.</li>
            <li className={legal.li}>Honour browser <code className={legal.code}>Do-Not-Track</code> signals as a default &ldquo;denied&rdquo; state until you explicitly grant consent.</li>
          </ul>
          <p className={legal.p}>You can manage or withdraw your consent at any time using the cookie preference controls on our website, or by contacting us directly.</p>
        </>
      ),
    },
    {
      id: 'dpdp', number: '6', title: 'DPDP Act (India) Compliance',
      content: (
        <>
          <p className={legal.p}>Under the <strong>Digital Personal Data Protection Act, 2023</strong>, you have the following rights as a Data Principal:</p>
          <ul className={legal.ul}>
            <li className={legal.li}><strong>Right to access</strong> — request a summary of your personal data we hold and the purposes for which it is processed.</li>
            <li className={legal.li}><strong>Right to correction and erasure</strong> — request that we correct inaccurate or incomplete data, or erase your data where it is no longer needed.</li>
            <li className={legal.li}><strong>Right to grievance redressal</strong> — raise a grievance and receive a response within the timeframe stipulated by the DPDP Act.</li>
            <li className={legal.li}><strong>Right to nominate</strong> — nominate another individual to exercise your rights in the event of your death or incapacity.</li>
            <li className={legal.li}><strong>Right to withdraw consent</strong> — withdraw consent at any time; withdrawal does not affect the lawfulness of processing carried out before withdrawal.</li>
          </ul>
          <p className={legal.p}>We act as the <strong>Data Fiduciary</strong> for data collected on this website. Cross-border data transfers, if any, are conducted only to countries notified by the Indian government as providing adequate data protection.</p>
        </>
      ),
    },
    {
      id: 'cookies', number: '7', title: 'Cookies and Tracking',
      content: (
        <>
          <p className={legal.p}>We use cookies and similar technologies to operate our website and, with your consent, to analyse usage and personalise content. For full details, see our <a href="/legal/cookies" className={legal.a}>Cookie Policy</a>.</p>
          <p className={legal.p}>No third-party analytics, session-replay, or marketing scripts are loaded until you have explicitly granted consent through our cookie consent banner.</p>
        </>
      ),
    },
    {
      id: 'contact', number: '8', title: 'Contact for Data Requests',
      content: (
        <>
          <p className={legal.p}>To exercise any of your rights, raise a grievance, or ask questions about this Privacy Policy, please contact us:</p>
          <address className={legal.address}>
            <p><strong>Tribhuban Concepts — Data Privacy</strong></p>
            <p>Email: <a href="mailto:hello@tribhubanconcepts.com" className={legal.a}>hello@tribhubanconcepts.com</a></p>
            <p>India</p>
          </address>
          <p className={legal.p}>We will respond to verifiable data requests within <strong>30 days</strong> of receipt, or within the timeframe required by applicable law.</p>
        </>
      ),
    },
  ];

  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="June 2025"
      description="How we collect, use, store, and protect your personal data in compliance with the DPDP Act (India) and GDPR."
      sections={sections}
    />
  );
}
