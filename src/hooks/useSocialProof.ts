import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SocialProofStats {
  userCount: number;
  vaultCount: number;
  totalSaved: number;
}

export function useSocialProof() {
  return useQuery({
    queryKey: ['social-proof-stats'],
    queryFn: async (): Promise<SocialProofStats> => {
      // Fetch all stats in parallel
      const [profilesResult, vaultsResult, amountsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('vaults').select('id', { count: 'exact', head: true }),
        supabase.from('vault_amounts').select('amount').eq('is_checked', true),
      ]);

      const userCount = profilesResult.count ?? 0;
      const vaultCount = vaultsResult.count ?? 0;
      const totalSaved = amountsResult.data?.reduce((sum, row) => sum + row.amount, 0) ?? 0;

      return { userCount, vaultCount, totalSaved };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
