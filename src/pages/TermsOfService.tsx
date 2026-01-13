import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';
import { Footer } from '@/components/Footer';
import { Logo } from '@/components/Logo';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Terms of Service — SaveTogether"
        description="Read the terms and conditions for using SaveTogether, your savings tracking app."
        path="/terms"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Logo size="md" />
            <div className="w-10" />
          </div>
        </header>

        <main className="flex-1 mx-auto max-w-4xl px-4 py-8 space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight mb-2">
              Terms of Service
            </h1>
            <p className="text-muted-foreground">Last updated: January 10, 2025</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using SaveTogether, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              SaveTogether is a savings tracking application that helps you set and track savings goals. 
              The service allows you to create "vaults" with goal amounts, check off amounts as you save, 
              and optionally collaborate with others on shared savings goals.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">3. Account Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate information when creating your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Share your account credentials with others</li>
              <li>Use automated systems to access the service without permission</li>
              <li>Harass, abuse, or harm other users</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">5. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The SaveTogether service, including its design, features, and content, is owned by us 
              and protected by intellectual property laws. You may not copy, modify, distribute, or 
              create derivative works based on our service without permission.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">6. User Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of the data you create in SaveTogether (vault names, goals, etc.). 
              By using the service, you grant us a license to store, process, and display your content 
              as necessary to provide the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">7. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              SaveTogether integrates with third-party services (such as payment processors). 
              Your use of these services is subject to their respective terms and privacy policies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">8. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              SaveTogether is provided "as is" without warranties of any kind. We do not guarantee 
              that the service will be uninterrupted, error-free, or secure. SaveTogether is a 
              tracking tool and does not provide financial advice.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, we shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages arising from your use of 
              the service. Our total liability shall not exceed the amount you paid us in the 
              past 12 months.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">10. Account Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may delete your account at any time through the Settings page. We may suspend 
              or terminate your account if you violate these terms. Upon termination, your data 
              will be deleted in accordance with our Privacy Policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">11. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these terms from time to time. We will notify you of significant 
              changes by posting a notice on the app or sending an email. Your continued use 
              of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">12. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of 
              the United States, without regard to conflict of law principles.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">13. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these terms, please reach out through the app or website.
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
