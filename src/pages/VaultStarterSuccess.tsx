import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Mail, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { AuthenticatedNav } from '@/components/AuthenticatedNav';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/Logo';

export default function VaultStarterSuccess() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      {user ? (
        <AuthenticatedNav />
      ) : (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
            <Logo size="sm" />
            <Link to="/auth">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          </div>
        </header>
      )}

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-lg w-full text-center">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            You're In! 🎉
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Your Vault Starter journey begins now.
          </p>

          <Card className="p-6 sm:p-8 text-left mb-8">
            <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              What happens next
            </h2>
            
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Check your inbox</p>
                  <p className="text-sm text-muted-foreground">
                    Your welcome email is on its way with everything you need to get started.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">14 days of guidance</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive 7 focused emails over the next 2 weeks — each one short, actionable, and designed to build your savings habit.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">No overwhelm, just progress</p>
                  <p className="text-sm text-muted-foreground">
                    Each email takes less than 5 minutes. Rest days are built in. You've got this.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {user ? (
              <Link to="/">
                <Button size="lg" className="w-full">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="lg" className="w-full">
                  Create Your Free Account <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
            
            <p className="text-sm text-muted-foreground">
              {user 
                ? "Create your first vault and start saving today."
                : "Sign up to track your progress and create vaults."
              }
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
