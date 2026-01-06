import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PiggyBank, Users, Target, CheckCircle2, Bell, TrendingUp } from 'lucide-react';

export default function HowToUse() {
  const navigate = useNavigate();

  const steps = [
    {
      icon: PiggyBank,
      title: 'Create a Vault',
      description: 'Start by creating a savings vault with a name and goal amount. Choose a color to make it yours.',
    },
    {
      icon: Target,
      title: 'Check Off Amounts',
      description: 'Your vault generates random savings amounts. When you save that amount, check it off to track your progress.',
    },
    {
      icon: TrendingUp,
      title: 'Build Your Streak',
      description: 'Save consistently to build your streak. Daily or weekly—pick your pace and stay motivated.',
    },
    {
      icon: Bell,
      title: 'Stay on Track',
      description: 'Watch your progress bar grow as you get closer to your goal. Celebrate small wins along the way.',
    },
  ];

  const collaboratorSteps = [
    {
      step: 1,
      title: 'Open Your Vault',
      description: 'Navigate to the vault you want to share and tap the menu button.',
    },
    {
      step: 2,
      title: 'Invite a Collaborator',
      description: 'Enter their email address to send an invitation. They\'ll receive an email to join.',
    },
    {
      step: 3,
      title: 'Save Together',
      description: 'Both of you can check off amounts independently. Your combined savings count toward the goal.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-5 flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-display font-bold tracking-tight">How to Use SaveTogether</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-12">
        {/* Getting Started Section */}
        <section>
          <h2 className="text-2xl font-display font-semibold tracking-tight mb-2">Getting Started</h2>
          <p className="text-muted-foreground mb-6">
            SaveTogether makes saving fun with a simple check-off system. Here's how it works.
          </p>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map((step, index) => (
              <Card key={index} className="border-border/60 bg-card/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-display">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Adding Collaborators Section */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-display font-semibold tracking-tight">Save with Others</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Invite friends or family to save together toward a shared goal. Perfect for trips, gifts, or household savings.
          </p>

          <div className="space-y-4">
            {collaboratorSteps.map((item) => (
              <Card key={item.step} className="border-border/60 bg-card/50">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-sm">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold mb-1">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Tips Section */}
        <section>
          <h2 className="text-2xl font-display font-semibold tracking-tight mb-2">Pro Tips</h2>
          <Card className="border-border/60 bg-card/50">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-vault-emerald mt-0.5" />
                <p className="text-sm">Start with a realistic goal you can achieve in 3-6 months.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-vault-emerald mt-0.5" />
                <p className="text-sm">Check off smaller amounts first to build momentum.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-vault-emerald mt-0.5" />
                <p className="text-sm">Use the streak feature to create a consistent savings habit.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-vault-emerald mt-0.5" />
                <p className="text-sm">Move your checked-off savings into a separate high-yield account.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="text-center pt-4">
          <Button onClick={() => navigate('/')} size="lg" className="font-display">
            Start Saving
          </Button>
        </div>
      </main>
    </div>
  );
}
