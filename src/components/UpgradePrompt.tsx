import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpgradePromptProps {
  message: string;
  feature?: string;
}

export function UpgradePrompt({ message, feature }: UpgradePromptProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('create-subscription-checkout', {
        body: { plan: 'pro', interval: 'month' },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.url) window.location.href = response.data.url;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center space-y-3">
      <div className="flex justify-center">
        <div className="rounded-full bg-muted p-3">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      <p className="text-sm font-medium">{message}</p>
      {feature && (
        <p className="text-xs text-muted-foreground">{feature} is available on Pro and Partner plans.</p>
      )}
      <Button size="sm" onClick={handleUpgrade} disabled={loading}>
        {loading ? 'Loading...' : 'Upgrade to Pro'}
      </Button>
    </div>
  );
}
