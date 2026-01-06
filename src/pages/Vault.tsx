import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { VaultGrid } from '@/components/VaultGrid';
import { ProgressBar } from '@/components/ProgressBar';
import { Celebration } from '@/components/Celebration';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { generateAmounts } from '@/lib/generateAmounts';

interface VaultAmount {
  id: string;
  amount: number;
  is_checked: boolean;
}

interface VaultData {
  id: string;
  name: string;
  goal_amount: number;
  created_by: string;
}

export default function Vault() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [vault, setVault] = useState<VaultData | null>(null);
  const [amounts, setAmounts] = useState<VaultAmount[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const hasCelebrated = useRef(false);

  useEffect(() => {
    if (!id || !user) return;

    const fetchVault = async () => {
      // Get vault info
      const { data: vaultData, error: vaultError } = await supabase
        .from('vaults')
        .select('*')
        .eq('id', id)
        .single();

      if (vaultError || !vaultData) {
        toast({
          title: 'Error',
          description: 'Vault not found.',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      setVault(vaultData);

      // Get user's amounts for this vault
      const { data: amountsData } = await supabase
        .from('vault_amounts')
        .select('id, amount, is_checked')
        .eq('vault_id', id)
        .eq('user_id', user.id)
        .order('created_at');

      // If no amounts exist for this user (joined shared vault), generate them
      if (!amountsData || amountsData.length === 0) {
        const newAmounts = generateAmounts(vaultData.goal_amount);
        const amountRecords = newAmounts.map(amount => ({
          vault_id: id,
          user_id: user.id,
          amount,
        }));

        const { data: inserted } = await supabase
          .from('vault_amounts')
          .insert(amountRecords)
          .select('id, amount, is_checked');

        setAmounts(inserted || []);
      } else {
        setAmounts(amountsData);
      }

      setLoading(false);
    };

    fetchVault();
  }, [id, user, navigate, toast]);

  const handleToggle = async (amountId: string, currentState: boolean) => {
    // Optimistic update
    setAmounts(prev =>
      prev.map(a =>
        a.id === amountId ? { ...a, is_checked: !currentState } : a
      )
    );

    const { error } = await supabase
      .from('vault_amounts')
      .update({
        is_checked: !currentState,
        checked_at: !currentState ? new Date().toISOString() : null,
      })
      .eq('id', amountId);

    if (error) {
      // Show loading on the tile during revert
      setLoadingId(amountId);
      
      // Revert on error
      setAmounts(prev =>
        prev.map(a =>
          a.id === amountId ? { ...a, is_checked: currentState } : a
        )
      );
      toast({
        title: 'Error',
        description: 'Failed to update. Please try again.',
        variant: 'destructive',
      });
      
      setTimeout(() => setLoadingId(null), 300);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !vault || !user) return;

    setInviting(true);

    // Check if already invited
    const { data: existing } = await supabase
      .from('vault_invitations')
      .select('id')
      .eq('vault_id', vault.id)
      .eq('invited_email', inviteEmail)
      .single();

    if (existing) {
      toast({
        title: 'Already invited',
        description: 'This person has already been invited.',
      });
      setInviting(false);
      return;
    }

    const { error } = await supabase.from('vault_invitations').insert({
      vault_id: vault.id,
      invited_email: inviteEmail,
      invited_by: user.id,
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invite.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Invited!',
        description: `${inviteEmail} will see this vault when they sign up.`,
      });
      setInviteOpen(false);
      setInviteEmail('');
    }

    setInviting(false);
  };

  const savedAmount = amounts
    .filter(a => a.is_checked)
    .reduce((sum, a) => sum + a.amount, 0);

  const isComplete = vault && savedAmount >= vault.goal_amount;

  // Trigger celebration when reaching 100%
  useEffect(() => {
    if (isComplete && !hasCelebrated.current) {
      hasCelebrated.current = true;
      setShowCelebration(true);
      toast({
        title: '🎉 Congratulations!',
        description: `You've completed your ${vault?.name} goal!`,
      });
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [isComplete, vault?.name, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!vault) return null;

  const isOwner = vault.created_by === user?.id;

  return (
    <div className="min-h-screen bg-background">
      <Celebration show={showCelebration} />
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">{vault.name}</h1>
          {isOwner && (
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Invite to Vault</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleInvite} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    They'll get their own grid to complete
                  </p>
                  <Button type="submit" className="w-full" disabled={inviting}>
                    {inviting ? 'Sending...' : 'Send Invite'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
          {!isOwner && <div className="w-10" />}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <ProgressBar 
          current={savedAmount} 
          goal={vault.goal_amount} 
          checkedCount={amounts.filter(a => a.is_checked).length}
          totalCount={amounts.length}
        />
        <VaultGrid amounts={amounts} onToggle={handleToggle} loadingId={loadingId} />
      </main>
    </div>
  );
}
