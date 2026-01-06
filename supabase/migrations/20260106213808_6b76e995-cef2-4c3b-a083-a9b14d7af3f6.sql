-- Create a SECURITY DEFINER helper to avoid RLS recursion when checking membership
CREATE OR REPLACE FUNCTION public.is_vault_member(_vault_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.vault_members vm
    WHERE vm.vault_id = _vault_id
      AND vm.user_id = _user_id
  );
$$;

-- Rebuild SELECT policies that previously caused recursion between vaults <-> vault_members
DROP POLICY IF EXISTS "Users can view vaults they are members of" ON public.vaults;
CREATE POLICY "Users can view vaults they are members of"
ON public.vaults
FOR SELECT
USING (
  auth.uid() = created_by
  OR public.is_vault_member(id, auth.uid())
);

DROP POLICY IF EXISTS "Users can view vault members for their vaults" ON public.vault_members;
CREATE POLICY "Users can view vault members for their vaults"
ON public.vault_members
FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM public.vaults v
    WHERE v.id = vault_members.vault_id
      AND v.created_by = auth.uid()
  )
  OR public.is_vault_member(vault_members.vault_id, auth.uid())
);

DROP POLICY IF EXISTS "Users can view amounts from shared vault members" ON public.vault_amounts;
CREATE POLICY "Users can view amounts from shared vault members"
ON public.vault_amounts
FOR SELECT
USING (
  public.is_vault_member(vault_amounts.vault_id, auth.uid())
);
