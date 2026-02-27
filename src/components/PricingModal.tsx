import { useState } from 'react';
import { Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    monthly: 0,
    yearly: 0,
    features: ['2 vaults', 'Amount tracking', 'Streak tracking', 'Milestone emails'],
    unavailable: ['Shared vaults', 'All accent themes', 'Data export'],
    cta: 'Current plan',
    disabled: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 4,
    yearly: 35,
    features: ['Unlimited vaults', 'Shared vaults', 'All accent themes', 'Data export', 'Streak tracking', 'Milestone emails'],
    unavailable: [],
    cta: 'Upgrade to Pro',
    disabled: false,
    highlight: true,
  },
  {
    id: 'partner',
    name: 'Partner',
    monthly: 6,
    yearly: 50,
    features: ['Everything in Pro', 'Joint vault dashboard', 'Partner progress view'],
    unavailable: [],
    cta: 'Upgrade to Partner',
    disabled: false,
  },
];

export function PricingModal({ open, onOpenChange }: PricingModalProps) {
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;
    setLoading(planId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('create-subscription-checkout', {
        body: { plan: planId, interval },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.url) window.location.href = response.data.url;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-center">Choose a plan</DialogTitle>
        </DialogHeader>

        {/* Billing interval toggle */}
        <div className="flex justify-center gap-1 p-1 bg-muted rounded-lg w-fit mx-auto">
          <button
            onClick={() => setInterval('month')}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${interval === 'month' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval('year')}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${interval === 'year' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'}`}
          >
            Yearly <span className="text-xs text-emerald-600 font-medium">Save ~25%</span>
          </button>
        </div>

        {/* Plan cards */}
        <div className="grid sm:grid-cols-3 gap-4 mt-2">
          {PLANS.map((plan) => {
            const price = interval === 'month' ? plan.monthly : plan.yearly;
            const perMonth = interval === 'year' && plan.yearly > 0
              ? (plan.yearly / 12).toFixed(2)
              : null;

            return (
              <div
                key={plan.id}
                className={`rounded-xl border p-4 flex flex-col gap-3 ${plan.highlight ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-border'}`}
              >
                <div>
                  <p className="font-semibold">{plan.name}</p>
                  <div className="mt-1">
                    {price === 0 ? (
                      <span className="text-2xl font-bold">Free</span>
                    ) : (
                      <>
                        <span className="text-2xl font-bold">${price}</span>
                        <span className="text-sm text-muted-foreground">/{interval === 'month' ? 'mo' : 'yr'}</span>
                        {perMonth && (
                          <p className="text-xs text-muted-foreground">${perMonth}/mo billed yearly</p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <ul className="space-y-1.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                  {plan.unavailable.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground line-through">
                      <span className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  size="sm"
                  variant={plan.highlight ? 'default' : 'outline'}
                  disabled={plan.disabled || loading === plan.id}
                  onClick={() => handleUpgrade(plan.id)}
                  className="w-full"
                >
                  {loading === plan.id ? 'Loading...' : plan.cta}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-2">
          Cancel anytime. No bank connection required.
        </p>
      </DialogContent>
    </Dialog>
  );
}
