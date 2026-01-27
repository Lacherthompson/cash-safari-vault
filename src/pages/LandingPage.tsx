import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { 
  Target, 
  Sparkles,
  ArrowRight,
  HelpCircle,
  BookOpen,
  Menu,
  Calculator,
  Quote,
} from 'lucide-react';
import SEO from '@/components/SEO';
import { Footer } from '@/components/Footer';
import { Logo } from '@/components/Logo';
import { SocialProofStats } from '@/components/SocialProofStats';
import { VaultDemo } from '@/components/VaultDemo';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  // Show sticky CTA after scrolling past hero section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowStickyCTA(scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


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
          The Savings Method
          <span className="text-primary"> That Actually Works</span>
        </h2>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Set a goal, check off each save, and watch your progress grow. No complicated budgets — just simple wins.
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

        {/* Testimonial */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="relative bg-muted/50 rounded-2xl p-6 sm:p-8">
            <Quote className="absolute top-4 left-4 h-8 w-8 text-primary/20" />
            <blockquote className="relative z-10">
              <p className="text-lg sm:text-xl text-foreground leading-relaxed mb-4">
                "I discovered three subscriptions I'd forgotten about — that's $47/month I now put straight into savings. 
                Three months in, I'm finally seeing real progress toward my goals."
              </p>
              <footer className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">MR</span>
                </div>
                <div className="text-left">
                  <cite className="not-italic font-medium text-foreground">Michelle R.</cite>
                  <p className="text-sm text-muted-foreground">Atlanta, GA</p>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
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

      {/* Sticky Mobile CTA */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3 transition-transform duration-300 ${
          showStickyCTA ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <Button 
          className="w-full font-display h-12 text-base gap-2" 
          onClick={() => navigate('/auth')}
        >
          Start Saving Free
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
    </>
  );
}
