import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type Plan = 'free' | 'pro' | 'partner';

interface SubscriptionContextType {
  plan: Plan;
  status: string;
  isProOrAbove: boolean;
  isPartner: boolean;
  vaultLimit: number;
  canShareVaults: boolean;
  canExport: boolean;
  currentPeriodEnd: Date | null;
  stripeCustomerId: string | null;
  loading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const FREE_VAULT_LIMIT = 2;

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<Plan>('free');
  const [status, setStatus] = useState('active');
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<Date | null>(null);
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPlan('free');
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan, status, current_period_end, stripe_customer_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setPlan((data.plan as Plan) ?? 'free');
        setStatus(data.status ?? 'active');
        setCurrentPeriodEnd(data.current_period_end ? new Date(data.current_period_end) : null);
        setStripeCustomerId(data.stripe_customer_id ?? null);
      } else if (!error) {
        // Auto-provision free tier row if missing
        await supabase.from('subscriptions').insert({
          user_id: user.id,
          plan: 'free',
          status: 'active',
        });
      }

      setLoading(false);
    };

    fetchSubscription();
  }, [user]);

  const isProOrAbove = plan === 'pro' || plan === 'partner';
  const isPartner = plan === 'partner';

  return (
    <SubscriptionContext.Provider value={{
      plan,
      status,
      isProOrAbove,
      isPartner,
      vaultLimit: isProOrAbove ? Infinity : FREE_VAULT_LIMIT,
      canShareVaults: isProOrAbove,
      canExport: isProOrAbove,
      currentPeriodEnd,
      stripeCustomerId,
      loading,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
