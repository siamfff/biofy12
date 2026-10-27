import { Navbar } from '../../components/public/Navbar';
import { Footer } from '../../components/public/Footer';
import { FiLock, FiEye, FiTrash2, FiShare2, FiUserCheck, FiMail } from 'react-icons/fi';

const SECTIONS = [
  {
    icon: FiUserCheck,
    title: '1. Information We Collect',
    body: `When you create an account, we collect your email address, username, and any profile information you choose to provide (display name, bio, location, avatar, background, links, socials, music). We also collect your IP address, browser type, and device information for security and analytics.`,
  },
  {
    icon: FiEye,
    title: '2. How We Use Your Information',
    body: `We use your information to operate and improve Nebula, personalize your experience, display your public profile, track profile analytics, prevent abuse, and communicate with you about your account or important updates.`,
  },
  {
    icon: FiShare2,
    title: '3. Public Profile Data',
    body: `Anything you add to your public profile (username, display name, bio, location, avatar, background, badges, links, socials, music) is publicly visible to anyone who visits your profile URL. Do not include information you want to keep private.`,
  },
  {
    icon: FiLock,
    title: '4. Authentication & Security',
    body: `We use Firebase Authentication to securely manage your login. Passwords are never stored in plain text. All traffic is encrypted via HTTPS. We do not sell your personal information to third parties.`,
  },
  {
    icon: FiShare2,
    title: '5. Third-Party Services',
    body: `We use trusted third-party services for hosting and functionality: Firebase (auth, database) and Cloudinary (media hosting). These services have their own privacy policies. We do not share your personal data with advertisers.`,
  },
  {
    icon: FiEye,
    title: '6. Analytics',
    body: `We collect anonymous analytics such as page views, link clicks, and referrers to help profile owners understand their audience. This data does not include personally identifiable information about visitors.`,
  },
  {
    icon: FiTrash2,
    title: '7. Data Retention',
    body: `Your data is retained as long as your account is active. If you delete your account, your profile data, uploaded media, and analytics are deleted from our servers within 30 days.`,
  },
  {
    icon: FiUserCheck,
    title: '8. Your Rights',
    body: `You can access, edit, or delete your data at any time from the Settings page. You can export your data by contacting us. If you are in the EU/UK, you have GDPR rights including access, rectification, and erasure.`,
  },
  {
    icon: FiLock,
    title: '9. Cookies & Storage',
    body: `We use browser local storage to keep you signed in and remember your preferences. We do not use third-party advertising cookies.`,
  },
  {
    icon: FiUserCheck,
    title: '10. Children\'s Privacy',
    body: `Nebula is not intended for children under 13. If we learn that we have collected information from a child under 13, we will delete it promptly.`,
  },
  {
    icon: FiMail,
    title: '11. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. Significant changes will be communicated through the app or by email.`,
  },
  {
    icon: FiMail,
    title: '12. Contact Us',
    body: `For privacy questions or data requests, contact us through our Discord community or Help Center.`,
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand/30 bg-brand/10 text-brand-soft text-xs font-medium mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-soft" />
            Legal
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-display">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted mt-4 max-w-xl mx-auto">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="rounded-2xl border border-brand/30 bg-brand/5 p-5 mb-8">
          <p className="text-sm text-brand-soft leading-relaxed">
            🔒 <strong className="text-white">Your privacy matters.</strong> Nebula is built
            with security and transparency in mind. This policy explains what data we
            collect, how we use it, and the controls you have.
          </p>
        </div>

        <div className="space-y-4">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <section
                key={s.title}
                className="rounded-2xl border border-border bg-bg-card p-6"
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-brand/15 text-brand-soft flex items-center justify-center shrink-0">
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-semibold text-white font-display mb-2">
                      {s.title}
                    </h2>
                    <p className="text-sm text-muted leading-relaxed">{s.body}</p>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-muted">
            Your trust is important to us. If you have concerns, please reach out.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}