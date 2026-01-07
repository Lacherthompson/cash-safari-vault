-- Create a security definer function to safely get current user's email
-- This prevents email enumeration attacks by hiding the lookup logic
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.profiles WHERE id = auth.uid();
$$;

-- Drop the existing vulnerable SELECT policy
DROP POLICY IF EXISTS "Users can view invitations for their vaults" ON public.vault_invitations;

-- Create new SELECT policy using the security definer function
CREATE POLICY "Users can view invitations for their vaults" 
ON public.vault_invitations 
FOR SELECT 
USING (
  auth.uid() = invited_by 
  OR invited_email = public.get_current_user_email()
);

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Invitees can update invitation status" ON public.vault_invitations;

-- Create new UPDATE policy using the security definer function
CREATE POLICY "Invitees can update invitation status" 
ON public.vault_invitations 
FOR UPDATE 
USING (invited_email = public.get_current_user_email());