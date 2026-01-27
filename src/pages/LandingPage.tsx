import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { 
  Target, 
  Sparkles,
  ArrowRight,
  HelpCircle,
  BookOpen,
  Menu,
  Calculator,
} from 'lucide-react';
import SEO from '@/components/SEO';
import { Footer } from '@/components/Footer';
import { Logo } from '@/components/Logo';
import { SocialProofStats } from '@/components/SocialProofStats';
import { VaultDemo } from '@/components/VaultDemo';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  return (
    <>
      <SEO
        title="SaveTogether — Track Your Savings Goals"
        description="Build your savings, one check at a time. Set goals, check off amounts as you save, and watch your progress grow. Free to use, no bank connection required."
        path="/"
      />
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-background sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:py-4 flex items-center justify-between">
          <Logo size="lg" />
          
          <TooltipProvider>
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/how-to-use')}>
                How it works
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/savings-guide')}>
                Savings Guide
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/vault-starter')}>
                    Savings Challenge
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="flex items-center gap-1.5">
                    <Calculator className="h-3.5 w-3.5" />
                    Includes a free savings calculator
                  </p>
                </TooltipContent>
              </Tooltip>
              <Button size="sm" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </div>
          </TooltipProvider>

          {/* Mobile Navigation */}
          <div className="flex sm:hidden items-center gap-2">
            <Button size="sm" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-2 mt-8">
                  <div className="self-center mb-6">
                    <Logo size="md" clickable={false} />
                  </div>
                  <Button 
                    variant="ghost" 
                    className="justify-start gap-3 h-12" 
                    onClick={() => { navigate('/how-to-use'); setMobileMenuOpen(false); }}
                  >
                    <HelpCircle className="h-5 w-5" />
                    How it works
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start gap-3 h-12" 
                    onClick={() => { navigate('/savings-guide'); setMobileMenuOpen(false); }}
                  >
                    <BookOpen className="h-5 w-5" />
                    Savings Guide
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start gap-3 h-12" 
                    onClick={() => { navigate('/vault-starter'); setMobileMenuOpen(false); }}
                  >
                    <Target className="h-5 w-5" />
                    Savings Challenge
                  </Button>
                  <div className="border-t border-border my-4" />
                  <Button 
                    className="gap-2" 
                    onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Sparkles className="h-4 w-4" />
          No bank link needed
        </div>
        
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6">
          Build your savings,
          <span className="text-primary"> one check at a time</span>
        </h2>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Set a goal, check off each save, and watch your progress grow. Small steps lead to big wins.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button size="lg" className="font-display text-lg h-14 px-8 gap-2" onClick={() => navigate('/auth')}>
            Start Saving Free
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="font-display text-lg h-14 px-8" onClick={() => navigate('/how-to-use')}>
            See How It Works
          </Button>
        </div>

        {/* Social Proof - Build trust first */}
        <div className="mb-12">
          <SocialProofStats />
        </div>

        {/* Visual Demo */}
        <VaultDemo />
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h3 className="text-3xl font-display font-bold tracking-tight mb-4">
          Ready to start saving?
        </h3>
        <p className="text-muted-foreground text-lg mb-8">
          Create your first vault in under a minute. It's free.
        </p>
        <Button size="lg" className="font-display text-lg h-14 px-10 gap-2" onClick={() => navigate('/auth')}>
          Get Started
          <ArrowRight className="h-5 w-5" />
        </Button>
      </section>

      <Footer />
    </div>
    </>
  );
}
