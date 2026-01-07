import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { useClickSound } from '@/hooks/useClickSound';
import { supabase } from '@/integrations/supabase/client';
import { VaultGrid } from '@/components/VaultGrid';
import { ProgressBar } from '@/components/ProgressBar';
import { Celebration } from '@/components/Celebration';
import { StreakBadge } from '@/components/StreakBadge';
import { VaultMenu, SortOption } from '@/components/VaultMenu';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { generateAmounts } from '@/lib/generateAmounts';
import savetogetherLogo from '@/assets/savetogether-logo.png';

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
  streak_frequency: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  accent_color: string;
}

export default function Vault() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { soundEnabled } = useSettings();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { playClick } = useClickSound();
  
  const [vault, setVault] = useState<VaultData | null>(null);
  const [amounts, setAmounts] = useState<VaultAmount[]>([]);
  const [originalOrder, setOriginalOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('default');
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

      setVault({
        ...vaultData,
        streak_frequency: vaultData.streak_frequency || 'weekly',
        current_streak: vaultData.current_streak || 0,
        longest_streak: vaultData.longest_streak || 0,
        accent_color: vaultData.accent_color || 'emerald',
      });

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
        setOriginalOrder(inserted?.map(a => a.id) || []);
      } else {
        setAmounts(amountsData);
        setOriginalOrder(amountsData.map(a => a.id));
      }

      setLoading(false);
    };

    fetchVault();
  }, [id, user, navigate, toast]);

  const handleToggle = async (amountId: string, currentState: boolean) => {
    // Play click sound if enabled
    if (soundEnabled) {
      playClick();
    }
    
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
      return;
    }

    // Update streak if checking (not unchecking)
    if (!currentState && vault) {
      const today = new Date().toISOString().split('T')[0];
      const lastActivity = vault.last_activity_date;
      
      let newStreak = vault.current_streak;
      const frequency = vault.streak_frequency;
      
      // Check if this is a new activity period
      if (lastActivity !== today) {
        const lastDate = lastActivity ? new Date(lastActivity) : null;
        const now = new Date();
        
        let shouldIncrement = false;
        let shouldReset = false;
        
        if (!lastDate) {
          shouldIncrement = true;
        } else {
          const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (frequency === 'daily') {
            if (daysDiff === 1) shouldIncrement = true;
            else if (daysDiff > 1) shouldReset = true;
          } else if (frequency === 'weekly') {
            if (daysDiff <= 7 && daysDiff >= 1) shouldIncrement = true;
            else if (daysDiff > 14) shouldReset = true;
          } else if (frequency === 'biweekly') {
            if (daysDiff <= 14 && daysDiff >= 1) shouldIncrement = true;
            else if (daysDiff > 28) shouldReset = true;
          }
        }
        
        if (shouldReset) {
          newStreak = 1;
        } else if (shouldIncrement) {
          newStreak = vault.current_streak + 1;
        }
        
        const newLongest = Math.max(vault.longest_streak, newStreak);
        
        await supabase
          .from('vaults')
          .update({
            current_streak: newStreak,
            longest_streak: newLongest,
            last_activity_date: today,
          })
          .eq('id', vault.id);
        
        setVault(prev => prev ? {
          ...prev,
          current_streak: newStreak,
          longest_streak: newLongest,
          last_activity_date: today,
        } : null);
      }
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

  const handleEditVault = async (name: string, frequency: string) => {
    if (!vault) return;
    
    const { error } = await supabase
      .from('vaults')
      .update({ name, streak_frequency: frequency })
      .eq('id', vault.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update vault.',
        variant: 'destructive',
      });
    } else {
      setVault(prev => prev ? { ...prev, name, streak_frequency: frequency } : null);
      toast({
        title: 'Vault updated',
        description: 'Your changes have been saved.',
      });
    }
  };

  const handleDeleteVault = async () => {
    if (!vault || !user) return;
    
    // Delete amounts first (due to foreign key)
    await supabase
      .from('vault_amounts')
      .delete()
      .eq('vault_id', vault.id);
    
    // Delete members
    await supabase
      .from('vault_members')
      .delete()
      .eq('vault_id', vault.id);
    
    // Delete invitations
    await supabase
      .from('vault_invitations')
      .delete()
      .eq('vault_id', vault.id);
    
    // Delete vault
    const { error } = await supabase
      .from('vaults')
      .delete()
      .eq('id', vault.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete vault.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Vault deleted',
        description: `${vault.name} has been deleted.`,
      });
      navigate('/');
    }
  };

  const handleResetProgress = async () => {
    if (!vault || !user) return;
    
    // Reset all amounts
    const { error } = await supabase
      .from('vault_amounts')
      .update({ is_checked: false, checked_at: null })
      .eq('vault_id', vault.id)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset progress.',
        variant: 'destructive',
      });
    } else {
      // Reset streak
      await supabase
        .from('vaults')
        .update({ current_streak: 0, last_activity_date: null })
        .eq('id', vault.id);
      
      setAmounts(prev => prev.map(a => ({ ...a, is_checked: false })));
      setVault(prev => prev ? { ...prev, current_streak: 0, last_activity_date: null } : null);
      hasCelebrated.current = false;
      
      toast({
        title: 'Progress reset',
        description: 'All amounts have been unchecked.',
      });
    }
  };

  const sortedAmounts = useMemo(() => {
    const sorted = [...amounts];
    
    switch (sortOption) {
      case 'amount-asc':
        return sorted.sort((a, b) => a.amount - b.amount);
      case 'amount-desc':
        return sorted.sort((a, b) => b.amount - a.amount);
      case 'checked-first':
        return sorted.sort((a, b) => (b.is_checked ? 1 : 0) - (a.is_checked ? 1 : 0));
      case 'unchecked-first':
        return sorted.sort((a, b) => (a.is_checked ? 1 : 0) - (b.is_checked ? 1 : 0));
      default:
        // Restore original order
        return sorted.sort((a, b) => 
          originalOrder.indexOf(a.id) - originalOrder.indexOf(b.id)
        );
    }
  }, [amounts, sortOption, originalOrder]);

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
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <img src={savetogetherLogo} alt="SaveTogether" className="h-[106px] cursor-pointer" onClick={() => navigate('/')} />
          <div className="flex items-center gap-1">
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
            <VaultMenu
              vaultName={vault.name}
              streakFrequency={vault.streak_frequency}
              onEdit={handleEditVault}
              onDelete={handleDeleteVault}
              onReset={handleResetProgress}
              sortOption={sortOption}
              onSortChange={setSortOption}
              isOwner={isOwner}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <StreakBadge 
          currentStreak={vault.current_streak} 
          longestStreak={vault.longest_streak}
          frequency={vault.streak_frequency}
        />
        <ProgressBar 
          current={savedAmount} 
          goal={vault.goal_amount} 
          checkedCount={amounts.filter(a => a.is_checked).length}
          totalCount={amounts.length}
          accentColor={vault.accent_color}
        />
        <VaultGrid amounts={sortedAmounts} onToggle={handleToggle} loadingId={loadingId} />
      </main>
    </div>
  );
}
