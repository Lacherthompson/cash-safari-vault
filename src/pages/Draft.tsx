import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Check, Mail, ArrowRight, Sparkles, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { AuthenticatedNav } from '@/components/AuthenticatedNav';
import { useAuth } from '@/hooks/useAuth';
import cashVaultLogo from '@/assets/cash-vault-logo.png';

const days = [
  { day: 1, title: "Pick your vault", description: "Choose where your savings will live" },
  { day: 2, title: "Choose one goal", description: "Emergency fund, vacation, pet fund — just one" },
  { day: 3, title: "Find your easy first $50", description: "Money you won't even miss" },
  { day: 5, title: "Set a realistic auto-transfer", description: "Small, automatic, painless" },
  { day: 7, title: "Fix one leak", description: "Not all of them — just one" },
  { day: 10, title: "Increase slightly", description: "Grow your savings without the pain" },
  { day: 14, title: "Lock in your rhythm", description: "Your new savings habit is set" },
];

export default function Draft() {
  const { user } = useAuth();
  const [goalAmount, setGoalAmount] = useState<string>('');
  const [monthlyAmount, setMonthlyAmount] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [encouragementIndex, setEncouragementIndex] = useState(0);

  const encouragements = [
    "Not as scary as you thought, right?",
    "See? Totally doable.",
    "You've got this.",
    "Simpler than it seemed, huh?",
    "That's a real plan right there.",
    "Look at you, already ahead of most people."
  ];

  const handleCheckout = () => {
    toast.info("Stripe checkout will be connected here", {
      description: "This is a preview — checkout coming soon!"
    });
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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      {user ? (
        <AuthenticatedNav />
      ) : (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={cashVaultLogo} alt="Cash Vault" className="h-8 w-auto" />
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          </div>
        </header>
      )}

      {/* Calculator Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-xl px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Calculator className="h-4 w-4" />
              Find Your Starting Point
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              How long until you hit your goal?
            </h1>
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
            14-Day Email Challenge
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Vault Starter
          </h2>
          
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto mb-4">
            A short, guided reset that helps you start saving — and actually stick to it.
          </p>
          
          <p className="text-lg text-muted-foreground/80 max-w-xl mx-auto mb-10">
            No budgeting homework. No finance jargon. Just walk with me for 14 days and we'll get your savings moving.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-lg px-8 py-6" onClick={handleCheckout}>
              Start for $10 <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground">One-time payment • Instant access</p>
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
              <h3 className="font-semibold mb-2">7 Focused Emails</h3>
              <p className="text-sm text-muted-foreground">Short, actionable steps delivered to your inbox</p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">No Overwhelm</h3>
              <p className="text-sm text-muted-foreground">One simple action at a time — that's it</p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Real Results</h3>
              <p className="text-sm text-muted-foreground">By day 14, you'll have a savings rhythm that sticks</p>
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
            {days.map((item) => (
              <div 
                key={item.day}
                className="flex items-start gap-4 p-4 rounded-lg bg-card border hover:border-primary/50 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">Day {item.day}</span>
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
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
          
          <Button size="lg" className="text-lg px-8 py-6" onClick={handleCheckout}>
            Get Vault Starter — $10 <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="mx-auto max-w-4xl px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Cash Vault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
