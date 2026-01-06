import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CreateVaultDialog } from '@/components/CreateVaultDialog';
import { VaultCard } from '@/components/VaultCard';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAmounts } from '@/lib/generateAmounts';

interface VaultWithProgress {
  id: string;
  name: string;
  goal_amount: number;
  saved_amount: number;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [vaults, setVaults] = useState<VaultWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchVaults = async () => {
    if (!user) return;
    
    // Get vaults user owns or is a member of
    const { data: ownedVaults, error: ownedError } = await supabase
      .from('vaults')
      .select('*')
      .eq('created_by', user.id);

    const { data: memberVaults, error: memberError } = await supabase
      .from('vault_members')
      .select('vault_id')
      .eq('user_id', user.id);

    if (ownedError || memberError) {
      console.error('Error fetching vaults:', ownedError || memberError);
      return;
    }

    const allVaultIds = [
      ...(ownedVaults?.map(v => v.id) || []),
      ...(memberVaults?.map(v => v.vault_id) || [])
    ];
    const uniqueVaultIds = [...new Set(allVaultIds)];

    // Get vault details and amounts for each
    const vaultsWithProgress: VaultWithProgress[] = [];
    
    for (const vaultId of uniqueVaultIds) {
      const { data: vault } = await supabase
        .from('vaults')
        .select('*')
        .eq('id', vaultId)
        .single();
      
      if (!vault) continue;

      // Get user's checked amounts for this vault
      const { data: amounts } = await supabase
        .from('vault_amounts')
        .select('amount, is_checked')
        .eq('vault_id', vaultId)
        .eq('user_id', user.id);

      const savedAmount = amounts
        ?.filter(a => a.is_checked)
        .reduce((sum, a) => sum + a.amount, 0) || 0;

      vaultsWithProgress.push({
        id: vault.id,
        name: vault.name,
        goal_amount: vault.goal_amount,
        saved_amount: savedAmount,
      });
    }

    setVaults(vaultsWithProgress);
    setLoading(false);
  };

  useEffect(() => {
    fetchVaults();
  }, [user]);

  const handleCreateVault = async (name: string, goalAmount: number) => {
    if (!user) return;

    // Create vault
    const { data: vault, error: vaultError } = await supabase
      .from('vaults')
      .insert({ name, goal_amount: goalAmount, created_by: user.id })
      .select()
      .single();

    if (vaultError || !vault) {
      toast({
        title: 'Error',
        description: 'Failed to create vault.',
        variant: 'destructive',
      });
      return;
    }

    // Add creator as member
    await supabase.from('vault_members').insert({
      vault_id: vault.id,
      user_id: user.id,
    });

    // Generate amounts
    const amounts = generateAmounts(goalAmount);
    const amountRecords = amounts.map(amount => ({
      vault_id: vault.id,
      user_id: user.id,
      amount,
    }));

    await supabase.from('vault_amounts').insert(amountRecords);

    toast({
      title: 'Vault created!',
      description: `${name} with $${goalAmount.toLocaleString()} goal.`,
    });

    fetchVaults();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Cash Vault</h1>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">Your Vaults</h2>
          <CreateVaultDialog onCreateVault={handleCreateVault} />
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">
            Loading...
          </div>
        ) : vaults.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No vaults yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first vault to start saving!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {vaults.map((vault) => (
              <VaultCard
                key={vault.id}
                id={vault.id}
                name={vault.name}
                goalAmount={vault.goal_amount}
                savedAmount={vault.saved_amount}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
