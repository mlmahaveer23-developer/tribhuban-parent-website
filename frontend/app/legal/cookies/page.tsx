import type { Metadata } from 'next';
import LegalPage, { legal } from '@/components/layout/LegalPage';

export const metadata: Metadata = {
  title: 'Cookie Policy — Tribhuban Concepts',
  description: 'How Tribhuban Concepts uses cookies and similar tracking technologies, and how you can control them.',
  robots: { index: true, follow: true },
};

export const revalidate = false;

export default function CookiesPage() {
  const sections = [
    {
      id: 'what-are-cookies', number: '1', title: 'What Are Cookies',
      content: (
        <>
          <p className={legal.p}>Cookies are small text files placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work more efficiently, remember your preferences, and provide information to website owners.</p>
          <p className={legal.p}>In addition to cookies, we may also use similar technologies such as <strong>web beacons</strong>, <strong>pixel tags</strong>, and <strong>local storage</strong> for similar purposes. This policy covers all such technologies collectively referred to as &ldquo;cookies&rdquo;.</p>
        </>
      ),
    },
    {
      id: 'types', number: '2', title: 'Types of Cookies We Use',
      content: (
        <>
          <p className={legal.p}>We categorise the cookies we use as follows:</p>

          <h3 className={legal.h3}>Strictly Necessary Cookies</h3>
          <p className={legal.p}>These cookies are essential for the Website to function. They do not collect information for marketing purposes and cannot be switched off. Examples include cookies that remember your consent preferences and security tokens. No consent is required for these cookies.</p>

          <h3 className={legal.h3}>Analytics Cookies</h3>
          <p className={legal.p}>With your consent, we use analytics tools (including Google Analytics 4, PostHog, and Microsoft Clarity) to understand how visitors interact with our Website — which pages are popular, how long people stay, and where they come from. All analytics data is aggregated and anonymised where possible.</p>

          <h3 className={legal.h3}>Marketing Cookies</h3>
          <p className={legal.p}>With your consent, we may use marketing cookies to track the effectiveness of advertising campaigns. These include cookies set by Google (gclid), Meta (fbclid), and similar advertising platforms. We do not use these cookies to build profiles for sale to third parties.</p>

          <h3 className={legal.h3}>Preference Cookies</h3>
          <p className={legal.p}>These cookies remember choices you make to improve your experience — for example, your preferred colour theme (light or dark mode). Stored in <code className={legal.code}>localStorage</code>, not transmitted to our servers.</p>
        </>
      ),
    },
    {
      id: 'control', number: '3', title: 'How to Control Cookies',
      content: (
        <>
          <p className={legal.p}>You have several options for controlling cookies:</p>
          <ul className={legal.ul}>
            <li className={legal.li}><strong>Our consent banner</strong> — when you first visit the Website, you can accept or decline non-essential cookies by category. You can change your preferences at any time using the cookie settings link in our footer.</li>
            <li className={legal.li}><strong>Browser settings</strong> — most browsers allow you to block or delete cookies through their settings. Note that blocking all cookies may affect Website functionality.</li>
            <li className={legal.li}><strong>Do Not Track</strong> — if your browser sends a <code className={legal.code}>Do-Not-Track: 1</code> signal, we treat this as a denial of consent for analytics and marketing cookies unless you subsequently grant explicit consent.</li>
            <li className={legal.li}><strong>Opt-out tools</strong> — you can opt out of Google Analytics tracking via the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className={legal.a}>Google Analytics Opt-out Browser Add-on</a>.</li>
          </ul>
          <p className={legal.p}>We do not load any analytics, session-replay, or marketing scripts until you have explicitly granted consent through our banner.</p>
        </>
      ),
    },
    {
      id: 'third-party', number: '4', title: 'Third-Party Cookies',
      content: (
        <>
          <p className={legal.p}>Some cookies on our Website are set by third-party services we use, subject to your consent. These third parties have their own privacy policies. Key third-party services include:</p>
          <ul className={legal.ul}>
            <li className={legal.li}><strong>Google Analytics 4</strong> — web analytics. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className={legal.a}>Google Privacy Policy</a>.</li>
            <li className={legal.li}><strong>PostHog</strong> — product analytics and session recording. See <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer" className={legal.a}>PostHog Privacy Policy</a>.</li>
            <li className={legal.li}><strong>Microsoft Clarity</strong> — heatmaps and session recordings. See <a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noopener noreferrer" className={legal.a}>Microsoft Privacy Statement</a>.</li>
            <li className={legal.li}><strong>Cloudflare Turnstile</strong> — bot and spam detection (used on forms). This is a strictly necessary technology. See <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className={legal.a}>Cloudflare Privacy Policy</a>.</li>
          </ul>
          <p className={legal.p}>We are not responsible for the content or privacy practices of these third-party websites or services.</p>
        </>
      ),
    },
    {
      id: 'contact', number: '5', title: 'Contact Us',
      content: (
        <>
          <p className={legal.p}>If you have questions about how we use cookies or wish to exercise your rights under the DPDP Act or GDPR in relation to cookie data, please contact us:</p>
          <address className={legal.address}>
            <p><strong>Tribhuban Concepts — Privacy</strong></p>
            <p>Email: <a href="mailto:hello@tribhubanconcepts.com" className={legal.a}>hello@tribhubanconcepts.com</a></p>
            <p>India</p>
          </address>
          <p className={legal.p}>For general privacy enquiries, please also refer to our <a href="/legal/privacy" className={legal.a}>Privacy Policy</a>.</p>
        </>
      ),
    },
  ];

  return (
    <LegalPage
      title="Cookie Policy"
      lastUpdated="June 2025"
      description="How we use cookies and similar tracking technologies on our website, and how you can control them."
      sections={sections}
    />
  );
}
