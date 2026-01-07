import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CreateVaultDialog } from '@/components/CreateVaultDialog';
import { VaultCard } from '@/components/VaultCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Settings, HelpCircle, BookOpen, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAmounts } from '@/lib/generateAmounts';
import { VaultColorId } from '@/lib/vaultColors';
import { trackVaultCreated } from '@/lib/analytics';
import savetogetherLogo from '@/assets/savetogether-logo.png';

interface VaultWithProgress {
  id: string;
  name: string;
  goal_amount: number;
  saved_amount: number;
  current_streak: number;
  streak_frequency: string;
  accent_color: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [vaults, setVaults] = useState<VaultWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const createDialogRef = useRef<{ open: () => void } | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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
        current_streak: vault.current_streak || 0,
        streak_frequency: vault.streak_frequency || 'weekly',
        accent_color: vault.accent_color || 'emerald',
      });
    }

    setVaults(vaultsWithProgress);
    setLoading(false);
  };

  useEffect(() => {
    fetchVaults();
  }, [user]);

  const handleCreateVault = async (name: string, goalAmount: number, accentColor: VaultColorId) => {
    if (!user) return;

    // Create vault
    const { data: vault, error: vaultError } = await supabase
      .from('vaults')
      .insert({ name, goal_amount: goalAmount, created_by: user.id, accent_color: accentColor })
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

    // Track vault creation in Google Analytics
    trackVaultCreated(goalAmount, name);

    toast({
      title: 'Vault created!',
      description: `${name} with $${goalAmount.toLocaleString()} goal.`,
    });

    fetchVaults();
  };

  const handleOpenCreateDialog = () => {
    createDialogRef.current?.open();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <img src={savetogetherLogo} alt="SaveTogether" className="h-[106px] cursor-pointer" onClick={() => navigate('/')} />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/how-to-use')}>
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/savings-guide')}>
              <BookOpen className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/settings')}>
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-destructive hover:text-destructive" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {loading ? (
          <div className="text-center text-muted-foreground py-12">
            <div className="loading-spinner mx-auto mb-3" />
            Loading your vaults...
          </div>
        ) : vaults.length === 0 ? (
          <>
            <EmptyState onCreateVault={handleOpenCreateDialog} />
            <div className="hidden">
              <CreateVaultDialog ref={createDialogRef as React.RefObject<{ open: () => void }>} onCreateVault={handleCreateVault} />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-display font-semibold tracking-tight">Your Vaults</h2>
                <p className="text-muted-foreground mt-1">
                  {vaults.length} vault{vaults.length !== 1 ? 's' : ''} • ${vaults.reduce((sum, v) => sum + v.saved_amount, 0).toLocaleString()} saved
                </p>
              </div>
              <CreateVaultDialog onCreateVault={handleCreateVault} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {vaults.map((vault) => (
                <VaultCard
                  key={vault.id}
                  id={vault.id}
                  name={vault.name}
                  goalAmount={vault.goal_amount}
                  savedAmount={vault.saved_amount}
                  currentStreak={vault.current_streak}
                  streakFrequency={vault.streak_frequency}
                  accentColor={vault.accent_color}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
