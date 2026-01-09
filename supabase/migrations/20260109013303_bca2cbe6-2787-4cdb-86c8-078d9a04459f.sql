-- Allow vault creators to reset all members' amounts (for combined progress reset)
CREATE POLICY "Vault creators can reset all member amounts"
ON public.vault_amounts
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.vaults
    WHERE vaults.id = vault_amounts.vault_id
    AND vaults.created_by = auth.uid()
  )
);