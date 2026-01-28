-- Fix vault_members INSERT policy - remove self-add bypass
-- Users should only be added via accepted invitations, not by adding themselves
DROP POLICY IF EXISTS "Vault creators can add members" ON public.vault_members;

CREATE POLICY "Vault creators can add members"
ON public.vault_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vaults
    WHERE vaults.id = vault_members.vault_id
    AND vaults.created_by = auth.uid()
  )
  OR
  -- Allow user to add themselves ONLY if they have an accepted invitation
  (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM vault_invitations vi
      WHERE vi.vault_id = vault_members.vault_id
      AND vi.invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND vi.status = 'accepted'
    )
  )
);