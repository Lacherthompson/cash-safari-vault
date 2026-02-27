import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { generateAmounts } from '@/lib/generateAmounts';
import { trackVaultCreated } from '@/lib/analytics';

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
  return { periodsNeeded, weeksNeeded };
}

export default function Onboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);
  const [customName, setCustomName] = useState('');
  const [vaultName, setVaultName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [pace, setPace] = useState<PaceLabel>('Weekly');
  const [savingsPerPeriod, setSavingsPerPeriod] = useState('50');
  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Skip if already onboarded or has vaults
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (localStorage.getItem('savetogether_onboarded') === 'true') {
      navigate('/');
    }
  }, [user, navigate]);

  // Animate progress bar on step 5
  useEffect(() => {
    if (step !== 5) return;
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
    if (step === 5 && progress === 100) {
      createVault();
    }
  }, [step, progress]);

  const handleGoalSelect = (index: number) => {
    setSelectedGoal(index);
    const option = GOAL_OPTIONS[index];
    if (option.name) {
      setVaultName(option.name);
    } else {
      setVaultName('');
    }
    setStep(3);
  };

  const handleAmountNext = () => {
    const amount = parseFloat(goalAmount);
    if (!amount || amount < 10) return;
    setStep(4);
  };

  const handleBuildVault = () => {
    setStep(5);
  };

  const createVault = async () => {
    if (!user || creating) return;
    setCreating(true);

    const name = (selectedGoal === 5 ? customName : vaultName) || 'My Savings Vault';
    const amount = parseFloat(goalAmount);

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
      navigate(`/vault/${vault.id}?welcome=true`);
    } catch {
      // On error fall back to dashboard
      localStorage.setItem('savetogether_onboarded', 'true');
      navigate('/');
    }
  };

  const finalName = selectedGoal === 5 ? customName : vaultName;
  const amountNum = parseFloat(goalAmount) || 0;
  const savingsNum = parseFloat(savingsPerPeriod) || 0;
  const { weeksNeeded } = calcPace(amountNum, pace, savingsNum);

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

            {/* Pace selector */}
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

            {/* Amount per period */}
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

            {/* Projection */}
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
                  Saving ${savingsNum.toLocaleString()} {pace.toLowerCase()}
                  {' '}toward a ${amountNum.toLocaleString()} goal
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

        {/* ── Step 5: Building ── */}
        {step === 5 && (
          <div className="text-center space-y-8 animate-in fade-in duration-300">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-4xl">🏦</span>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold tracking-tight mb-2">
                Building your vault…
              </h2>
              <p className="text-muted-foreground text-sm">
                Personalizing{finalName ? ` "${finalName}"` : ' your savings plan'}…
              </p>
            </div>

            {/* Progress bar */}
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
