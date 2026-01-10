import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';
import { Footer } from '@/components/Footer';
import savetogetherLogo from '@/assets/savetogether-logo.png';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Privacy Policy — SaveTogether"
        description="Learn how SaveTogether collects, uses, and protects your personal information. Your privacy matters to us."
        path="/privacy"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img 
              src={savetogetherLogo} 
              alt="SaveTogether" 
              className="h-16 sm:h-[80px] cursor-pointer" 
              onClick={() => navigate('/')} 
            />
            <div className="w-10" />
          </div>
        </header>

        <main className="flex-1 mx-auto max-w-4xl px-4 py-8 space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight mb-2">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">Last updated: January 10, 2025</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you use SaveTogether, we collect the following information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Account Information:</strong> Your email address when you create an account.</li>
              <li><strong className="text-foreground">Savings Data:</strong> The vaults you create, goal amounts, and amounts you check off.</li>
              <li><strong className="text-foreground">Usage Data:</strong> Anonymous analytics about how you use the app (via Google Analytics), including pages visited and features used.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use your information to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Provide and maintain the SaveTogether service</li>
              <li>Track your savings progress and display it in your dashboard</li>
              <li>Send you vault invitation emails when invited by other users</li>
              <li>Improve our app based on anonymous usage patterns</li>
              <li>Process payments if you purchase premium features (via Stripe)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Supabase:</strong> For secure data storage and authentication.</li>
              <li><strong className="text-foreground">Google Analytics:</strong> For anonymous usage analytics.</li>
              <li><strong className="text-foreground">Stripe:</strong> For secure payment processing (if applicable).</li>
              <li><strong className="text-foreground">Resend:</strong> For sending transactional emails like vault invitations.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We take your data security seriously. Your data is encrypted in transit and at rest. 
              We use industry-standard security practices to protect your information. Your password 
              is hashed and never stored in plain text.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Access:</strong> View all your savings data within the app.</li>
              <li><strong className="text-foreground">Delete:</strong> Permanently delete your account and all associated data from Settings.</li>
              <li><strong className="text-foreground">Export:</strong> Contact us to request an export of your data.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use essential cookies to keep you logged in and remember your preferences. 
              Google Analytics uses cookies to collect anonymous usage data. You can disable 
              cookies in your browser settings, but this may affect app functionality.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              SaveTogether is not intended for children under 13. We do not knowingly collect 
              personal information from children under 13. If you believe a child has provided 
              us with personal information, please contact us.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any 
              changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this privacy policy, please reach out through the app or website.
            </p>
          </section>

          <div className="pt-4">
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Home
            </Button>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
