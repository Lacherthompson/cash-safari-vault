import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
import { ArrowLeft, UserPlus, Users, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { generateAmounts } from '@/lib/generateAmounts';
import { trackAmountChecked, trackAmountUnchecked, trackGoalCompleted } from '@/lib/analytics';
import { AuthenticatedNav } from '@/components/AuthenticatedNav';

interface VaultAmount {
  id: string;
  amount: number;
  is_checked: boolean;
  user_id: string;
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

interface VaultMember {
  id: string;
  user_id: string;
  email: string;
}

export default function Vault() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { soundEnabled } = useSettings();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [members, setMembers] = useState<VaultMember[]>([]);
  const [membersOpen, setMembersOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<VaultMember | null>(null);
  const [removingMember, setRemovingMember] = useState(false);
  const hasCelebrated = useRef(false);

  useEffect(() => {
    if (!id || !user) return;

    const fetchVault = async () => {
      const invitedParamRaw = searchParams.get('invited');
      const invitedParam = invitedParamRaw?.trim().toLowerCase();
      const currentEmail = user.email?.trim().toLowerCase();

      // If the link is for a specific email but the user is signed in with a different one,
      // explain why access fails.
      if (invitedParam && currentEmail && invitedParam !== currentEmail) {
        toast({
          title: 'Wrong account',
          description: `This invite was sent to ${invitedParamRaw}. You're signed in as ${user.email}. Please sign in with the invited email.`,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // First, check if the current user has an invitation for this vault.
      const invitedEmailToCheck = (invitedParamRaw || user.email || '').trim().toLowerCase();
      const { data: invitation } = await supabase
        .from('vault_invitations')
        .select('id, status')
        .eq('vault_id', id)
        .eq('invited_email', invitedEmailToCheck)
        .in('status', ['pending', 'accepted'])
        .maybeSingle();

      // If invited, ensure they're a member (so they can pass vault RLS policies)
      if (invitation) {
        const { error: memberErr } = await supabase.from('vault_members').insert({
          vault_id: id,
          user_id: user.id,
          email: user.email,
        } as { vault_id: string; user_id: string; email: string | undefined });

        if (memberErr) {
          console.warn('vault_members insert error (may be safe to ignore):', memberErr);
        }

        // Mark invitation accepted (if it was pending)
        if (invitation.status === 'pending') {
          await supabase
            .from('vault_invitations')
            .update({ status: 'accepted' })
            .eq('id', invitation.id);
        }
      }

      // Get vault info
      const { data: vaultData, error: vaultError } = await supabase
        .from('vaults')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (vaultError || !vaultData) {
        toast({
          title: 'Error',
          description: 'Vault not found or you don\'t have access.',
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

      // Get ALL amounts for this vault (combined progress across all members)
      const { data: allAmountsData } = await supabase
        .from('vault_amounts')
        .select('id, amount, is_checked, user_id')
        .eq('vault_id', id)
        .order('created_at');

      // Check if current user has amounts in this vault
      const userAmounts = allAmountsData?.filter(a => a.user_id === user.id) || [];

      // If no amounts exist for this user (joined shared vault), generate them
      if (userAmounts.length === 0) {
        const newAmounts = generateAmounts(vaultData.goal_amount);
        const amountRecords = newAmounts.map(amount => ({
          vault_id: id,
          user_id: user.id,
          amount,
        }));

        const { data: inserted } = await supabase
          .from('vault_amounts')
          .insert(amountRecords)
          .select('id, amount, is_checked, user_id');

        // Combine with existing amounts from other members
        const combinedAmounts = [...(allAmountsData || []), ...(inserted || [])];
        setAmounts(combinedAmounts.map(a => ({ id: a.id, amount: a.amount, is_checked: a.is_checked, user_id: a.user_id })));
        setOriginalOrder(combinedAmounts.map(a => a.id));
      } else {
        // Use all amounts from all members for combined progress
        setAmounts(allAmountsData?.map(a => ({ id: a.id, amount: a.amount, is_checked: a.is_checked, user_id: a.user_id })) || []);
        setOriginalOrder(allAmountsData?.map(a => a.id) || []);
      }

      // Fetch vault members if owner
      if (vaultData.created_by === user.id) {
        // Fetch members with their stored email; fall back to vault_invitations for legacy members
        const { data: membersData } = await supabase
          .from('vault_members')
          .select('id, user_id')
          .eq('vault_id', id);

        if (membersData && membersData.length > 0) {
          const { data: invitations } = await supabase
            .from('vault_invitations')
            .select('invited_email, invited_by')
            .eq('vault_id', id)
            .eq('status', 'accepted');

          const membersList: VaultMember[] = membersData.map(member => {
            if (member.user_id === user.id) {
              return { id: member.id, user_id: member.user_id, email: user.email || 'You' };
            }
            const match = invitations?.find(
              inv => inv.invited_email && inv.invited_email !== user.email
            );
            return { id: member.id, user_id: member.user_id, email: match?.invited_email || 'Member' };
          });

          setMembers(membersList);
        }
      }

      setLoading(false);
    };

    fetchVault();

    // Subscribe to realtime changes for vault_amounts
    const channel = supabase
      .channel(`vault-amounts-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vault_amounts',
          filter: `vault_id=eq.${id}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as { id: string; amount: number; is_checked: boolean; user_id: string };
            setAmounts(prev =>
              prev.map(a =>
                a.id === updated.id
                  ? { ...a, is_checked: updated.is_checked }
                  : a
              )
            );
          } else if (payload.eventType === 'INSERT') {
            const inserted = payload.new as { id: string; amount: number; is_checked: boolean; user_id: string };
            setAmounts(prev => {
              // Avoid duplicates
              if (prev.some(a => a.id === inserted.id)) return prev;
              return [...prev, { id: inserted.id, amount: inserted.amount, is_checked: inserted.is_checked, user_id: inserted.user_id }];
            });
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string };
            setAmounts(prev => prev.filter(a => a.id !== deleted.id));
          }
        }
      )
      .subscribe();

    // Subscribe to realtime changes for the vault itself (streak, etc.)
    const vaultChannel = supabase
      .channel(`vault-meta-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vaults',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const updated = payload.new as Partial<VaultData>;
          setVault(prev => prev ? { ...prev, ...updated } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(vaultChannel);
    };
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

    // Track the check/uncheck event
    const toggledAmount = amounts.find(a => a.id === amountId);
    if (toggledAmount && id) {
      if (!currentState) {
        trackAmountChecked(toggledAmount.amount, id);
      } else {
        trackAmountUnchecked(toggledAmount.amount, id);
      }
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
    if (!vault || !user) return;

    const normalizedEmail = inviteEmail.trim().toLowerCase();
    if (!normalizedEmail) return;

    // Warn if vault already has 8+ members (creator + members)
    const currentMemberCount = members.length > 0 ? members.length : 1;
    if (currentMemberCount >= 8) {
      toast({
        title: 'Large group warning',
        description: `This vault already has ${currentMemberCount} members. Consider creating separate vaults for smaller groups.`,
      });
    }

    setInviting(true);

    try {
      // Check if already invited (grab the most recent invite if there are duplicates)
      const { data: existing, error: existingError } = await supabase
        .from('vault_invitations')
        .select('id')
        .eq('vault_id', vault.id)
        .eq('invited_email', normalizedEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingError) {
        console.warn('Error checking existing invitation (continuing anyway):', existingError);
      }

      // Only insert if not already invited
      if (!existing) {
        const { error } = await supabase.from('vault_invitations').insert({
          vault_id: vault.id,
          invited_email: normalizedEmail,
          invited_by: user.id,
        });

        if (error) {
          toast({
            title: 'Error',
            description: 'Failed to create invitation. Please try again.',
            variant: 'destructive',
          });
          return;
        }
      }

      // Send invitation email via backend function (works for new or resend)
      const { error: emailError } = await supabase.functions.invoke('send-vault-invitation', {
        body: {
          invitedEmail: normalizedEmail,
          vaultId: vault.id,
          vaultName: vault.name,
          inviterEmail: user.email,
        },
      });

      if (emailError) {
        console.error('Failed to send invitation email:', emailError);
        toast({
          title: 'Invitation created',
          description: 'Email delivery failed. Please try again in a moment.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: existing ? 'Invite Resent!' : 'Invitation Sent!',
        description: `Check ${normalizedEmail}'s inbox (and spam folder).`,
      });

      setInviteOpen(false);
      setInviteEmail('');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !vault || !user) return;
    
    setRemovingMember(true);
    
    try {
      // Remove from vault_members
      const { error: memberError } = await supabase
        .from('vault_members')
        .delete()
        .eq('id', memberToRemove.id);

      if (memberError) {
        toast({
          title: 'Error',
          description: 'Failed to remove member.',
          variant: 'destructive',
        });
        return;
      }

      // Delete their amounts for this vault
      await supabase
        .from('vault_amounts')
        .delete()
        .eq('vault_id', vault.id)
        .eq('user_id', memberToRemove.user_id);

      // Update invitation status if exists
      await supabase
        .from('vault_invitations')
        .delete()
        .eq('vault_id', vault.id)
        .eq('invited_email', memberToRemove.email);

      setMembers(prev => prev.filter(m => m.id !== memberToRemove.id));
      
      toast({
        title: 'Member removed',
        description: `${memberToRemove.email} has been removed from the vault.`,
      });
    } finally {
      setRemovingMember(false);
      setMemberToRemove(null);
    }
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

    // Only vault owner can reset progress for everyone
    if (vault.created_by !== user.id) {
      toast({
        title: 'Permission denied',
        description: 'Only the vault owner can reset progress.',
        variant: 'destructive',
      });
      return;
    }
    
    // Reset ALL amounts for this vault (all members)
    const { error } = await supabase
      .from('vault_amounts')
      .update({ is_checked: false, checked_at: null })
      .eq('vault_id', vault.id);

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
        description: 'All amounts have been unchecked for everyone.',
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
    if (isComplete && !hasCelebrated.current && vault) {
      hasCelebrated.current = true;
      setShowCelebration(true);
      
      // Track goal completion in Google Analytics
      trackGoalCompleted(vault.goal_amount, vault.name);
      
      toast({
        title: '🎉 Congratulations!',
        description: `You've completed your ${vault.name} goal!`,
      });
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [isComplete, vault, toast]);

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
      <AuthenticatedNav />
      
      {/* Vault-specific toolbar */}
      <div className="border-b border-border/40 bg-background/60">
        <div className="mx-auto max-w-4xl px-4 py-2 flex items-center justify-between">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Vaults</span>
          </Button>
          <div className="flex items-center gap-1">
            {isOwner && members.length > 1 && (
              <Dialog open={membersOpen} onOpenChange={setMembersOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">{members.length} Members</span>
                    <span className="sm:hidden">{members.length}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Vault Members</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div 
                        key={member.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <span className="text-sm truncate flex-1">
                          {member.user_id === user?.id ? `${member.email} (You)` : member.email}
                        </span>
                        {member.user_id !== user?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => setMemberToRemove(member)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {isOwner && (
              <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Save Together</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Invite a Savings Partner</DialogTitle>
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
                      They'll join this vault and track progress alongside you
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

          {/* Remove member confirmation */}
          <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove member?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove {memberToRemove?.email} from the vault and delete their saved progress.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={removingMember}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleRemoveMember}
                  disabled={removingMember}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {removingMember ? 'Removing...' : 'Remove'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

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
        <VaultGrid amounts={sortedAmounts} onToggle={handleToggle} loadingId={loadingId} currentUserId={user?.id} />
      </main>
    </div>
  );
}
