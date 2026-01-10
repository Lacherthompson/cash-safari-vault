-- Add policy to allow vault creators to remove members from their vaults
CREATE POLICY "Vault creators can remove members"
ON public.vault_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.vaults
    WHERE vaults.id = vault_members.vault_id
    AND vaults.created_by = auth.uid()
  )
);