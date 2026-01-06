-- 1. Add input validation constraints on vaults table
ALTER TABLE public.vaults 
ADD CONSTRAINT valid_goal_amount CHECK (goal_amount > 0 AND goal_amount <= 1000000000),
ADD CONSTRAINT valid_name_length CHECK (char_length(name) > 0 AND char_length(name) <= 100);

-- 2. Add validation for vault_amounts to prevent invalid amounts
ALTER TABLE public.vault_amounts 
ADD CONSTRAINT valid_amount CHECK (amount > 0 AND amount <= 1000000000);

-- 3. Add missing DELETE policy for profiles table
CREATE POLICY "Users can delete own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = id);

-- 4. Add safeguard function to prevent deletion of users with shared vaults
CREATE OR REPLACE FUNCTION public.check_vault_ownership_before_profile_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user has created vaults with other members
  IF EXISTS (
    SELECT 1 FROM public.vaults v
    JOIN public.vault_members vm ON v.id = vm.vault_id
    WHERE v.created_by = OLD.id
    AND vm.user_id != OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete profile while you own shared vaults. Transfer ownership or remove members first.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Create trigger to check before profile deletion
CREATE TRIGGER check_shared_vaults_before_delete
BEFORE DELETE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_vault_ownership_before_profile_delete();