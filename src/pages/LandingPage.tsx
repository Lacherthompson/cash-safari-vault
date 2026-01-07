import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  PiggyBank, 
  Target, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import SEO from '@/components/SEO';
import savetogetherLogo from '@/assets/savetogether-logo.png';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: PiggyBank,
      title: 'Smart Savings Tracker',
      description: 'Check off random amounts as you save. A fun, gamified approach to reaching your goals.',
    },
    {
      icon: Target,
      title: 'Set Any Goal',
      description: 'Whether it\'s $500 or $10,000, create vaults for vacations, emergencies, or big purchases.',
    },
    {
      icon: Users,
      title: 'Save Together',
      description: 'Invite friends or family to collaborate on shared savings goals.',
    },
    {
      icon: TrendingUp,
      title: 'Build Streaks',
      description: 'Stay motivated with daily or weekly saving streaks that track your consistency.',
    },
  ];

  const benefits = [
    'Free to use',
    'No bank connection required',
    'Works with any savings account',
    'Track multiple goals at once',
  ];

  return (
    <>
      <SEO
        title="SaveTogether — Track Your Savings Goals"
        description="Turn saving into a game you'll win. Set goals, check off amounts as you save, and watch your progress grow. Free to use, no bank connection required."
        path="/"
      />
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-background sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <img src={savetogetherLogo} alt="SaveTogether" className="h-25" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/how-to-use')}>
              How it works
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/savings-guide')}>
              Savings Guide
            </Button>
            <Button size="sm" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Sparkles className="h-4 w-4" />
          A better way to save
        </div>
        
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6">
          Turn saving into a
          <span className="text-primary"> game you'll win</span>
        </h2>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          SaveTogether makes saving money fun with a simple check-off system. 
          Set a goal, check off amounts as you save, and watch your progress grow.
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

        {/* Benefits */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-vault-emerald" />
              {benefit}
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-display font-bold tracking-tight mb-3">
              Everything you need to save smarter
            </h3>
            <p className="text-muted-foreground text-lg">
              Simple tools designed to help you reach your goals faster.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/60 bg-card/80">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-lg mb-2">{feature.title}</h4>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-display font-bold tracking-tight mb-3">
            Saving made simple
          </h3>
          <p className="text-muted-foreground text-lg">
            Three easy steps to reach your savings goal.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { step: 1, title: 'Create a Vault', desc: 'Set your savings goal and give it a name.' },
            { step: 2, title: 'Check Off Amounts', desc: 'Save any amount and check it off your list.' },
            { step: 3, title: 'Reach Your Goal', desc: 'Watch your progress grow until you hit 100%.' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-xl mx-auto mb-4">
                {item.step}
              </div>
              <h4 className="font-display font-semibold text-lg mb-2">{item.title}</h4>
              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Guides Section */}
      <section className="bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <div className="grid sm:grid-cols-2 gap-6">
            <Card 
              className="border-border/60 bg-card/80 cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => navigate('/how-to-use')}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 rounded-xl bg-primary/10">
                  <HelpCircle className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-lg mb-1">How to Use SaveTogether</h4>
                  <p className="text-muted-foreground text-sm">Learn the app and how to invite collaborators</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto" />
              </CardContent>
            </Card>

            <Card 
              className="border-border/60 bg-card/80 cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => navigate('/savings-guide')}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 rounded-xl bg-vault-emerald/10">
                  <BookOpen className="h-8 w-8 text-vault-emerald" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-lg mb-1">Savings Guide</h4>
                  <p className="text-muted-foreground text-sm">Compare HYSAs, CDs, and other savings options</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto" />
              </CardContent>
            </Card>
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

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/20">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center text-sm text-muted-foreground">
          <p>SaveTogether — Save smarter, together.</p>
        </div>
      </footer>
    </div>
    </>
  );
}
