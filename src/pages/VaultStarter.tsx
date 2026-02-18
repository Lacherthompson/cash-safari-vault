import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Check, Mail, ArrowRight, Sparkles, Calculator, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AuthenticatedNav } from '@/components/AuthenticatedNav';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '@/components/Logo';

const days = [
  { day: 0, title: "Welcome to Vault Starter", description: "Let's do this together. Small steps, realistic actions, no shaming.", isWelcome: true },
  { day: 1, title: "Your first step", description: "Create ONE vault with a goal that feels emotionally motivating" },
  { day: 2, title: "Make it feel real", description: "Add one personal detail to your vault" },
  { day: 3, title: "The $50 you're about to find", description: "Find one forgotten or unnecessary charge" },
  { day: 4, title: "Let it sink in", description: "Rest day — no action today", isRest: true },
  { day: 5, title: "Pick your saving moment", description: "Decide when you'll manually add money to your vault" },
  { day: 6, title: "You didn't fall behind", description: "Rest day — if you missed something earlier, you didn't fail", isRest: true },
  { day: 7, title: "One week in", description: "Check your progress bar and adjust if needed" },
  { day: 8, title: "Midpoint pause", description: "Rest day — tomorrow we'll do a quick check-in", isRest: true },
  { day: 9, title: "Quick check-in", description: "Ask yourself: does this goal still feel doable?" },
  { day: 10, title: "More breathing room (if you need it)", description: "Bookmark helpful resources if you need extra support" },
  { day: 11, title: "You're still doing great", description: "Rest day — staying engaged matters most", isRest: true },
  { day: 12, title: "Strengthen the habit", description: "Add any amount to your vault — even $1" },
  { day: 13, title: "Almost there", description: "Rest day — tomorrow we wrap up", isRest: true },
  { day: 14, title: "Don't stop now", description: "You built a system — not just a number" },
];

export default function VaultStarter() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [goalAmount, setGoalAmount] = useState<string>('');
  const [monthlyAmount, setMonthlyAmount] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [encouragementIndex, setEncouragementIndex] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');

  const encouragements = [
    "Not as scary as you thought, right?",
    "See? Totally doable.",
    "You've got this.",
    "Simpler than it seemed, huh?",
    "That's a real plan right there.",
    "Look at you, already ahead of most people."
  ];

  // Handle success/cancel from Stripe redirect
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success("Payment successful!", {
        description: "Check your email — your first Vault Starter message is on its way!"
      });
    } else if (searchParams.get('canceled') === 'true') {
      toast.info("Checkout canceled", {
        description: "No worries — you can try again whenever you're ready."
      });
    }
  }, [searchParams]);

  const handleCheckout = async () => {
    // Validate guest email
    if (!user) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestEmail)) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-vault-starter-checkout', {
        body: { email: guestEmail || undefined }
      });

      if (error) throw error;
      if (!data?.url) throw new Error("No checkout URL returned");

      // Stripe Checkout cannot load reliably inside embedded iframes.
      // Try opening in a new tab first; fallback to same-tab navigation.
      const opened = window.open(data.url, '_blank', 'noopener,noreferrer');
      if (!opened) window.location.href = data.url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error("Checkout failed", {
        description: error instanceof Error ? error.message : "Please try again"
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const calculateMonths = () => {
    const goal = parseFloat(goalAmount);
    const monthly = parseFloat(monthlyAmount);
    if (goal > 0 && monthly > 0) {
      return Math.ceil(goal / monthly);
    }
    return 0;
  };

  const handleCalculate = () => {
    if (parseFloat(goalAmount) > 0 && parseFloat(monthlyAmount) > 0) {
      setEncouragementIndex(Math.floor(Math.random() * encouragements.length));
      setShowResult(true);
    }
  };

  const months = calculateMonths();
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  const formatTimeframe = () => {
    if (years > 0 && remainingMonths > 0) {
      return `${years} year${years > 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    } else if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else {
      return `${months} month${months > 1 ? 's' : ''}`;
    }
  };

  const scrollToVaultStarter = () => {
    document.getElementById('vault-starter')?.scrollIntoView({ behavior: 'smooth' });
  };

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

      {/* Hero Logo Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-4xl px-4 text-center flex flex-col items-center">
          <Logo size="hero" clickable={false} />
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mt-6">
            Save smarter, together. Your journey to financial freedom starts here.
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-xl px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Calculator className="h-4 w-4" />
              Find Your Starting Point
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              How long until you hit your goal?
            </h2>
            <p className="text-muted-foreground">
              Let's see where you stand. No judgment — just a simple plan.
            </p>
          </div>

          <Card className="p-6 sm:p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  What are you saving for? How much do you need?
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    placeholder="1,000"
                    value={goalAmount}
                    onChange={(e) => {
                      setGoalAmount(e.target.value);
                      setShowResult(false);
                    }}
                    className="pl-7"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  How much can you realistically save each month?
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    placeholder="100"
                    value={monthlyAmount}
                    onChange={(e) => {
                      setMonthlyAmount(e.target.value);
                      setShowResult(false);
                    }}
                    className="pl-7"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Be honest. Small is okay.</p>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={handleCalculate}
                disabled={!goalAmount || !monthlyAmount}
              >
                Show Me My Plan
              </Button>
            </div>

            {showResult && months > 0 && (
              <div className="mt-8 pt-8 border-t">
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Here's your starting point:</p>
                  <p className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                    {formatTimeframe()}
                  </p>
                  <p className="text-lg">
                    to save <span className="font-semibold">${parseFloat(goalAmount).toLocaleString()}</span>
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <p className="text-center text-muted-foreground">
                    {encouragements[encouragementIndex]}
                  </p>
                </div>

                <div className="space-y-4 text-center">
                  <p className="font-medium">
                    This is the plan.
                  </p>
                  <p className="text-muted-foreground">
                    Now comes the hard part: actually sticking to it.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Most people know how much to save. The challenge is making it happen — week after week.
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-dashed">
                  <p className="text-center text-sm text-muted-foreground mb-4">
                    This plan works best when paired with a vault and a routine.
                  </p>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={scrollToVaultStarter}
                  >
                    Get Guided Support with Vault Starter <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Hero Section */}
      <section id="vault-starter" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Mail className="h-4 w-4" />
            14-Day Email Journey
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Vault Starter
          </h2>
          
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto mb-4">
            A short, guided reset that helps you start saving — and actually stick to it.
          </p>

          <p className="text-lg text-muted-foreground/80 max-w-xl mx-auto mb-6">
            No budgeting homework. No finance jargon. Just walk with me for 14 days and we'll get your savings moving.
          </p>

          <p className="text-sm text-muted-foreground/80 mb-8">
            Trusted by 2,100+ savers on SaveTogether
          </p>

          <div className="flex flex-col items-center gap-4">
            {!user && (
              <Input
                type="email"
                placeholder="Your email — we'll send your first day here"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full max-w-xs text-center"
              />
            )}
            <Button
              size="lg"
              className="text-lg px-8 py-6"
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Start for $12 <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground">One-time payment • Instant access</p>
            <p className="text-xs text-muted-foreground/70 -mt-2">
              Less than a coffee. 7-day money-back guarantee — no questions asked.
            </p>
          </div>

          <div className="mt-10 max-w-sm mx-auto bg-muted/40 rounded-xl px-5 py-4 text-sm text-muted-foreground italic border border-border/40">
            "I didn't think $12 would change anything. By day 3 I'd already canceled a subscription I forgot I had."
            <span className="block mt-2 not-italic text-xs font-medium text-foreground/60">— Jasmine T., SaveTogether user</span>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            What's Inside
          </h2>
          
          <div className="grid sm:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">14 Days of Guidance</h3>
              <p className="text-sm text-muted-foreground">7 action emails + 7 rest days so you don't burn out</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">5 Minutes a Day</h3>
              <p className="text-sm text-muted-foreground">One small action per email — that's it, seriously</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Find $50 You Didn't Know You Had</h3>
              <p className="text-sm text-muted-foreground">Day 3 walks you through spotting a forgotten charge</p>
            </Card>
          </div>
        </div>
      </section>

      {/* The Journey */}
      <section className="py-16">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
            Your 14-Day Journey
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Each email takes less than 5 minutes to read and act on.
          </p>
          
          <div className="space-y-4">
            {days.slice(0, 10).map((item) => (
              <div 
                key={item.day}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                  item.isWelcome 
                    ? 'bg-primary/5 border-primary/30 hover:border-primary/50' 
                    : item.isRest 
                      ? 'bg-muted/50 border-muted hover:border-muted-foreground/30' 
                      : 'bg-card hover:border-primary/50'
                }`}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  item.isWelcome 
                    ? 'bg-primary/20' 
                    : item.isRest 
                      ? 'bg-muted' 
                      : 'bg-primary/10'
                }`}>
                  <span className={`text-sm font-bold ${
                    item.isWelcome ? 'text-primary' : item.isRest ? 'text-muted-foreground' : 'text-primary'
                  }`}>
                    {item.day === 0 ? '👋' : `Day ${item.day}`}
                  </span>
                </div>
                <div>
                  <h3 className={`font-semibold ${item.isRest ? 'text-muted-foreground' : ''}`}>{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
            
            <div className="flex items-center gap-4 p-4 rounded-lg border border-dashed border-muted-foreground/30">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                <span className="text-lg">...</span>
              </div>
              <p className="text-muted-foreground font-medium">Plus 5 more days of guidance, rest days & reflection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            This Is For You If...
          </h2>
          
          <div className="space-y-4">
            {[
              "You've tried to save before but it never sticks",
              "Budgeting apps make you feel worse, not better",
              "You want to start small without the pressure",
              "You know you should save but don't know where to begin",
              "You're tired of financial advice that doesn't fit your life"
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
                <p className="text-lg">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Start?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            14 days from now, you'll have a savings habit that actually works for you.
          </p>
          
          {!user && (
            <div className="flex flex-col items-center gap-2 mb-4 w-full max-w-xs mx-auto">
              <Input
                type="email"
                placeholder="Your email address"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full text-center"
              />
            </div>
          )}
          <Button
            size="lg"
            className="text-lg px-8 py-6"
            onClick={handleCheckout}
            disabled={isCheckingOut}
          >
            {isCheckingOut ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Get Vault Starter — $12 <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground/60 mt-3">
            One-time payment · 7-day money-back guarantee
          </p>
        </div>
      </section>

      <Footer className="mt-auto" />
    </div>
  );
}
