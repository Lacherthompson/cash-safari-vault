-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view vault members for their vaults" ON vault_members;
DROP POLICY IF EXISTS "Users can view amounts from shared vault members" ON vault_amounts;
DROP POLICY IF EXISTS "Users can view vaults they are members of" ON vaults;

-- Recreate with correct references (fixing the self-referencing bug)
CREATE POLICY "Users can view vault members for their vaults" 
ON vault_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM vaults 
    WHERE vaults.id = vault_members.vault_id 
    AND vaults.created_by = auth.uid()
  )
  OR auth.uid() = user_id
);

CREATE POLICY "Users can view amounts from shared vault members" 
ON vault_amounts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM vault_members vm
    WHERE vm.vault_id = vault_amounts.vault_id 
    AND vm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view vaults they are members of" 
ON vaults 
FOR SELECT 
USING (
  auth.uid() = created_by 
  OR EXISTS (
    SELECT 1 FROM vault_members 
    WHERE vault_members.vault_id = vaults.id 
    AND vault_members.user_id = auth.uid()
  )
);