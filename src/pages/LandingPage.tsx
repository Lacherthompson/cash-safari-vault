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
  CheckSquare,
  TrendingUp,
} from 'lucide-react';
import SEO from '@/components/SEO';
import { Footer } from '@/components/Footer';
import { Logo } from '@/components/Logo';
import { SocialProofStats } from '@/components/SocialProofStats';
import { TestimonialCarousel } from '@/components/TestimonialCarousel';
import { useABTest, trackABConversion } from '@/hooks/useABTest';
import { useScrollDepthTracking } from '@/hooks/useScrollDepthTracking';
import { VaultDemo } from '@/components/VaultDemo';

// A/B Test Configuration - Both variants are strong
const HEADLINE_TEST = {
  testName: 'homepage_headline_mar2026',
  variants: {
    A: 'Watch your savings grow, $5 at a time',
    B: 'Save $5 at a time. Hit your goals faster.',
  },
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  
  // A/B test for headline
  const { variant, value: headline } = useABTest(HEADLINE_TEST);
  
  // Scroll depth tracking
  useScrollDepthTracking();

  // Track conversion when user clicks CTA
  const handleCTAClick = () => {
    trackABConversion(HEADLINE_TEST.testName, variant);
    navigate('/auth');
  };

  // Show sticky CTA immediately on mobile, after scroll on desktop
  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    if (isMobile) {
      setShowStickyCTA(true);
      return;
    }
    
    const handleScroll = () => {
      setShowStickyCTA(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <>
      <SEO
        title="SaveTogether — Track Your Savings Goals"
        description="Build your savings, one check at a time. Set goals, check off amounts as you save, and watch your progress grow. No bank connection required."
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

      {/* Hero Section - Mobile-first layout */}
      <section className="mx-auto max-w-5xl px-4 py-6 sm:py-16 text-center">
        {/* Compact trust badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-6">
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="sm:hidden">2,100+ savers • No bank link</span>
          <span className="hidden sm:inline">No bank link needed</span>
        </div>
        
        {/* Shorter headline on mobile */}
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight mb-3 sm:mb-6">
          {headline}
        </h2>
        
        {/* Mobile: short punchy description */}
        <p className="sm:hidden text-sm text-muted-foreground max-w-xs mx-auto mb-4 leading-relaxed">
          Set a goal. Check off saves. Watch your money grow — no bank link needed.
        </p>

        {/* Desktop: full description */}
        <p className="hidden sm:block text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
          Set a goal, check off each save, and watch your progress grow. No complicated budgets — just simple wins.
        </p>

        <p className="hidden sm:block text-base text-muted-foreground/80 max-w-xl mx-auto mb-10 italic">
          Saving feels hard — not because you're bad with money, but because most tools don't make it feel human.
        </p>

        {/* Demo FIRST on mobile - above the fold */}
        <div className="mb-4 sm:hidden">
          <VaultDemo />
        </div>

        {/* Single CTA on mobile, two buttons on desktop */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-2 sm:mb-4">
          <Button size="lg" className="w-full sm:w-auto font-display text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8 gap-2" onClick={handleCTAClick}>
            Start Saving Free
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button variant="outline" size="lg" className="hidden sm:flex font-display text-lg h-14 px-8" onClick={() => navigate('/how-to-use')}>
            See How It Works
          </Button>
        </div>

        {/* Friction reducer */}
        <p className="text-xs text-muted-foreground/60 mb-8 sm:mb-12">
          Free to start · No credit card · Start in 60 seconds
        </p>

        {/* How it works — 3 steps, inline so visitors don't need to leave */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-sm sm:max-w-2xl mx-auto mb-8 sm:mb-12 text-left">
          {[
            {
              icon: <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
              title: 'Set a goal',
              desc: 'Name your vault and pick your target amount.',
            },
            {
              icon: <CheckSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
              title: 'Check off saves',
              desc: 'Tap amounts as you set money aside — $5, $20, whatever fits.',
            },
            {
              icon: <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
              title: 'Watch it grow',
              desc: 'Track streaks, hit milestones, reach your goal.',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title}>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                {icon}
              </div>
              <p className="font-semibold text-xs sm:text-sm mb-1">{title}</p>
              <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div className="mb-6 sm:mb-12">
          <SocialProofStats />
        </div>

        {/* Demo on desktop (already shown on mobile above) */}
        <div className="hidden sm:block">
          <VaultDemo />
        </div>

        {/* Rotating Testimonials */}
        <div className="mt-10 sm:mt-16">
          <TestimonialCarousel />
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
        <Button size="lg" className="font-display text-lg h-14 px-10 gap-2" onClick={handleCTAClick}>
          Start Your First Vault
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
          onClick={handleCTAClick}
        >
          Start Saving Free
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
    </>
  );
}
