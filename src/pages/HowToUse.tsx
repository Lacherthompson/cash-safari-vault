import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import SEO from '@/components/SEO';
import { Footer } from '@/components/Footer';
import { Logo } from '@/components/Logo';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import howItWorksVideo from '@/assets/how-it-works.mp4';

export default function HowToUse() {
  const navigate = useNavigate();

  const steps = [
    { step: '1', text: 'Create a vault with your savings goal' },
    { step: '2', text: 'Check off amounts as you save them' },
    { step: '3', text: 'Watch your progress grow' },
  ];

  return (
    <>
      <SEO
        title="How SaveTogether Works — Simple Savings Tracking"
        description="Create a vault, check off amounts as you save, and watch your progress grow. It's that simple."
        path="/how-to-use"
        type="article"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Logo size="lg" />
            <div className="w-10" />
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-12 flex-1">
          {/* Hero */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight mb-3">
              How It Works
            </h1>
            <p className="text-lg text-muted-foreground">
              Saving money doesn't have to be complicated.
            </p>
          </div>

          {/* Video Demo */}
          <div className="mb-12 rounded-2xl overflow-hidden border border-border/60 shadow-lg">
            <AspectRatio ratio={1}>
              <video
                src={howItWorksVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </AspectRatio>
          </div>

          {/* 3 Simple Steps */}
          <div className="space-y-4 mb-12">
            {steps.map((item) => (
              <div 
                key={item.step} 
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/60"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold">
                  {item.step}
                </div>
                <p className="text-lg font-medium">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Pro Tip */}
          <div className="bg-muted/50 rounded-xl p-5 mb-12">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Pro tip:</span> Invite a friend or partner to save together — you'll both stay more motivated.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button 
              size="lg" 
              className="font-display text-lg h-14 px-8 gap-2" 
              onClick={() => navigate('/auth')}
            >
              Start Saving
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </main>

        <Footer className="mt-auto" />
      </div>
    </>
  );
}
