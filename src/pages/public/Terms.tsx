import { Navbar } from '../../components/public/Navbar';
import { Footer } from '../../components/public/Footer';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using Nebula, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our platform.`,
  },
  {
    title: '2. Your Account',
    body: `You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must be at least 13 years old to use Nebula. You agree to provide accurate information and to keep it up to date.`,
  },
  {
    title: '3. Username & Content',
    body: `You may choose a username, upload images, video, audio, and add links to your profile. You retain ownership of the content you upload, but you grant Nebula a worldwide, non-exclusive, royalty-free license to host, display, and distribute that content as part of the service.`,
  },
  {
    title: '4. Prohibited Content',
    body: `You may not use Nebula to upload, share, or promote: illegal content, hate speech, harassment, sexually explicit material, malware, spam, phishing, or content that infringes on intellectual property rights. We reserve the right to remove any content that violates these rules and to suspend or terminate your account.`,
  },
  {
    title: '5. Impersonation',
    body: `You may not impersonate another person, brand, or entity, or claim to represent them without authorization. Verified badges and Staff badges are reserved for approved users only.`,
  },
  {
    title: '6. Premium Subscriptions',
    body: `Premium features are offered as either one-time purchases or subscriptions. Payments are non-refundable except where required by law. We may change Premium features and pricing with reasonable notice.`,
  },
  {
    title: '7. Service Availability',
    body: `We aim to keep Nebula available at all times but do not guarantee uninterrupted access. We may perform maintenance, updates, or experience downtime. We are not liable for any loss resulting from unavailable service.`,
  },
  {
    title: '8. Account Termination',
    body: `You may delete your account at any time from the Settings page. We may suspend or terminate your account if you violate these Terms, engage in abusive behavior, or for any other reason at our sole discretion.`,
  },
  {
    title: '9. Disclaimer',
    body: `Nebula is provided "as is" and "as available" without warranties of any kind, express or implied. We are not responsible for the accuracy, safety, or legality of user-generated content.`,
  },
  {
    title: '10. Limitation of Liability',
    body: `To the maximum extent permitted by law, Nebula is not liable for any indirect, incidental, special, or consequential damages arising from your use of the service.`,
  },
  {
    title: '11. Changes to Terms',
    body: `We may update these Terms from time to time. Continued use of the service after changes means you accept the updated Terms.`,
  },
  {
    title: '12. Contact',
    body: `Questions about these Terms? Reach out through our Discord community or the Help Center.`,
  },
];

export default function Terms() {
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
            Terms of Service
          </h1>
          <p className="text-sm text-muted mt-4 max-w-xl mx-auto">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="space-y-6">
          {SECTIONS.map((s) => (
            <section
              key={s.title}
              className="rounded-2xl border border-border bg-bg-card p-6"
            >
              <h2 className="text-lg font-semibold text-white font-display mb-2">
                {s.title}
              </h2>
              <p className="text-sm text-muted leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-muted">
            By using Nebula, you acknowledge that you have read and agree to these Terms.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}