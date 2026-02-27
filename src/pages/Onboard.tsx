import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateAmounts } from '@/lib/generateAmounts';
import { trackVaultCreated } from '@/lib/analytics';
import { lovable } from '@/integrations/lovable/index';

const GOAL_OPTIONS = [
  { emoji: '🛫', label: 'Vacation', name: 'Vacation Fund' },
  { emoji: '🚗', label: 'New Car', name: 'Car Fund' },
  { emoji: '🏠', label: 'Home / Moving', name: 'Home Fund' },
  { emoji: '🛡️', label: 'Emergency Fund', name: 'Emergency Fund' },
  { emoji: '🎓', label: 'Education', name: 'Education Fund' },
  { emoji: '✨', label: 'Something else', name: '' },
];

const PACE_OPTIONS = [
  { label: 'Weekly', weeksMultiplier: 1 },
  { label: 'Biweekly', weeksMultiplier: 2 },
  { label: 'Monthly', weeksMultiplier: 4.33 },
] as const;

type PaceLabel = typeof PACE_OPTIONS[number]['label'];

function calcPace(goalAmount: number, paceLabel: PaceLabel, savingsPerPeriod: number) {
  const pace = PACE_OPTIONS.find(p => p.label === paceLabel)!;
  const periodsNeeded = savingsPerPeriod > 0 ? Math.ceil(goalAmount / savingsPerPeriod) : 0;
  const weeksNeeded = Math.ceil(periodsNeeded * pace.weeksMultiplier);
  return { weeksNeeded };
}

export default function Onboard() {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);
  const [customName, setCustomName] = useState('');
  const [vaultName, setVaultName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [pace, setPace] = useState<PaceLabel>('Weekly');
  const [savingsPerPeriod, setSavingsPerPeriod] = useState('50');
  // Step 5 — signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  // Step 6 — building
  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState(0);

  // If already onboarded, go to dashboard
  // If authenticated with pending vault, skip to step 6
  useEffect(() => {
    if (!user) return;
    if (localStorage.getItem('savetogether_onboarded') === 'true') {
      navigate('/');
      return;
    }
    // User just authenticated (email signup or Google OAuth return)
    const pending = localStorage.getItem('savetogether_pending_vault');
    if (pending) {
      setStep(6);
    }
  }, [user, navigate]);

  // Animate progress bar on step 6
  useEffect(() => {
    if (step !== 6) return;
    setProgress(0);
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 4;
      });
    }, 60);
    return () => clearInterval(timer);
  }, [step]);

  // Create vault once progress bar fills
  useEffect(() => {
    if (step === 6 && progress === 100) {
      createVault();
    }
  }, [step, progress]);

  const handleGoalSelect = (index: number) => {
    setSelectedGoal(index);
    setVaultName(GOAL_OPTIONS[index].name);
    setStep(3);
  };

  const handleAmountNext = () => {
    const amount = parseFloat(goalAmount);
    if (!amount || amount < 10) return;
    setStep(4);
  };

  const handleBuildVault = () => {
    const name = (selectedGoal === 5 ? customName : vaultName) || 'My Savings Vault';
    const amount = parseFloat(goalAmount);
    localStorage.setItem('savetogether_pending_vault', JSON.stringify({ name, goalAmount: amount }));
    if (user) {
      setStep(6); // Already logged in — skip signup
    } else {
      setStep(5); // Show signup form
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (password.length < 8) {
      toast({ title: 'Password too short', description: 'Password must be at least 8 characters.', variant: 'destructive' });
      return;
    }
    setSignupLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) {
        if (error.message.includes('already registered')) {
          toast({ title: 'Already registered', description: 'This email is in use. Try signing in.', variant: 'destructive' });
        } else {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
      }
      // On success, user state updates → useEffect above advances to step 6
    } finally {
      setSignupLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        setGoogleLoading(false);
      }
      // On success, browser redirects — pending vault in localStorage survives the redirect
    } catch {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
      setGoogleLoading(false);
    }
  };

  const createVault = async () => {
    if (!user || creating) return;
    setCreating(true);

    // Read vault data — from state if available, else from localStorage (OAuth return case)
    let name: string;
    let amount: number;

    const pending = localStorage.getItem('savetogether_pending_vault');
    if (pending) {
      const parsed = JSON.parse(pending);
      name = parsed.name || 'My Savings Vault';
      amount = parsed.goalAmount;
    } else {
      name = (selectedGoal === 5 ? customName : vaultName) || 'My Savings Vault';
      amount = parseFloat(goalAmount);
    }

    try {
      const { data: vault, error: vaultError } = await supabase
        .from('vaults')
        .insert({ name, goal_amount: amount, created_by: user.id, accent_color: 'emerald' })
        .select()
        .single();

      if (vaultError || !vault) throw vaultError;

      await supabase.from('vault_members').insert({
        vault_id: vault.id,
        user_id: user.id,
      });

      const amounts = generateAmounts(amount);
      await supabase.from('vault_amounts').insert(
        amounts.map(a => ({ vault_id: vault.id, user_id: user.id, amount: a }))
      );

      trackVaultCreated(amount, name);
      localStorage.setItem('savetogether_onboarded', 'true');
      localStorage.removeItem('savetogether_pending_vault');
      navigate(`/vault/${vault.id}?welcome=true`);
    } catch {
      localStorage.setItem('savetogether_onboarded', 'true');
      localStorage.removeItem('savetogether_pending_vault');
      navigate('/');
    }
  };

  const finalName = selectedGoal === 5 ? customName : vaultName;
  const amountNum = parseFloat(goalAmount) || 0;
  const savingsNum = parseFloat(savingsPerPeriod) || 0;
  const { weeksNeeded } = calcPace(amountNum, pace, savingsNum);

  // Compute display name from localStorage for step 6 (OAuth return case)
  const pendingVaultName = (() => {
    try {
      const p = localStorage.getItem('savetogether_pending_vault');
      return p ? JSON.parse(p).name : null;
    } catch { return null; }
  })();
  const displayName = finalName || pendingVaultName;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* ── Step 1: Welcome ── */}
        {step === 1 && (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>

            <div>
              <h1 className="text-3xl font-display font-bold tracking-tight mb-3">
                Your savings journey starts here.
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                No bank connection. No complicated budgets.<br />Just you and your goal.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              Join 2,100+ savers already building this habit
            </div>

            <Button
              size="lg"
              className="w-full h-14 font-display text-lg gap-2"
              onClick={() => setStep(2)}
            >
              Let's go
              <ArrowRight className="h-5 w-5" />
            </Button>

            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/auth" className="text-primary hover:underline">Sign in</Link>
            </p>
          </div>
        )}

        {/* ── Step 2: Goal category ── */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h2 className="text-2xl font-display font-bold tracking-tight mb-1">
                What's your first goal?
              </h2>
              <p className="text-sm text-muted-foreground">Pick one to get started.</p>
            </div>

            <div className="space-y-2.5">
              {GOAL_OPTIONS.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleGoalSelect(i)}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/40 transition-colors text-left"
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Name + amount ── */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h2 className="text-2xl font-display font-bold tracking-tight mb-1">
                How much do you need?
              </h2>
              <p className="text-sm text-muted-foreground">You can always adjust this later.</p>
            </div>

            <div className="space-y-4">
              {selectedGoal === 5 ? (
                <Input
                  placeholder="What are you saving for?"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="h-12"
                  autoFocus
                />
              ) : (
                <Input
                  placeholder="Vault name"
                  value={vaultName}
                  onChange={e => setVaultName(e.target.value)}
                  className="h-12"
                />
              )}

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                <Input
                  type="number"
                  placeholder="Goal amount"
                  value={goalAmount}
                  onChange={e => setGoalAmount(e.target.value)}
                  className="h-12 pl-8"
                  min={10}
                />
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-14 font-display text-lg gap-2"
              onClick={handleAmountNext}
              disabled={!goalAmount || parseFloat(goalAmount) < 10 || (selectedGoal === 5 && !customName.trim())}
            >
              Next
              <ArrowRight className="h-5 w-5" />
            </Button>

            <button
              onClick={() => setStep(2)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {/* ── Step 4: Savings pace ── */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <h2 className="text-2xl font-display font-bold tracking-tight mb-1">
                How often can you set money aside?
              </h2>
              <p className="text-sm text-muted-foreground">We'll show you how fast you'll get there.</p>
            </div>

            <div className="flex rounded-lg border border-border overflow-hidden">
              {PACE_OPTIONS.map(p => (
                <button
                  key={p.label}
                  onClick={() => setPace(p.label)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    pace === p.label
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card hover:bg-accent'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Amount per {pace.toLowerCase()} savings
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                <Input
                  type="number"
                  value={savingsPerPeriod}
                  onChange={e => setSavingsPerPeriod(e.target.value)}
                  className="h-12 pl-8"
                  min={1}
                />
              </div>
            </div>

            {savingsNum > 0 && amountNum > 0 && (
              <div className="rounded-xl bg-primary/10 p-4 text-center space-y-1">
                <p className="text-sm text-muted-foreground">At this pace:</p>
                <p className="font-display font-bold text-lg">
                  You'll reach your goal in{' '}
                  <span className="text-primary">
                    {weeksNeeded < 5
                      ? `${weeksNeeded} week${weeksNeeded !== 1 ? 's' : ''}`
                      : `~${Math.round(weeksNeeded / 4.33)} month${Math.round(weeksNeeded / 4.33) !== 1 ? 's' : ''}`}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Saving ${savingsNum.toLocaleString()} {pace.toLowerCase()} toward a ${amountNum.toLocaleString()} goal
                </p>
              </div>
            )}

            <Button
              size="lg"
              className="w-full h-14 font-display text-lg gap-2"
              onClick={handleBuildVault}
              disabled={!savingsPerPeriod || savingsNum <= 0}
            >
              Build My Vault
              <ArrowRight className="h-5 w-5" />
            </Button>

            <button
              onClick={() => setStep(3)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {/* ── Step 5: Sign up ── */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold tracking-tight mb-1">
                Create your free account
              </h2>
              <p className="text-sm text-muted-foreground">Save your progress and access your vault.</p>
            </div>

            {/* Google sign-in */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 font-semibold gap-3"
              onClick={handleGoogleSignup}
              disabled={googleLoading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {googleLoading ? '...' : 'Continue with Google'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 text-muted-foreground">or</span>
              </div>
            </div>

            <form onSubmit={handleEmailSignup} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                className="h-12"
              />
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="h-12"
                />
                <PasswordStrengthIndicator password={password} />
              </div>
              <Button type="submit" className="w-full h-12 font-semibold" disabled={signupLoading}>
                {signupLoading ? '...' : 'Create Account & Build Vault'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">Free to start. No credit card needed.</p>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/auth" className="text-primary hover:underline">Sign in</Link>
            </p>

            <button
              onClick={() => setStep(4)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {/* ── Step 6: Building ── */}
        {step === 6 && (
          <div className="text-center space-y-8 animate-in fade-in duration-300">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-4xl">🏦</span>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold tracking-tight mb-2">
                Building your vault…
              </h2>
              <p className="text-muted-foreground text-sm">
                Personalizing{displayName ? ` "${displayName}"` : ' your savings plan'}…
              </p>
            </div>

            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-2 bg-primary rounded-full transition-all duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
