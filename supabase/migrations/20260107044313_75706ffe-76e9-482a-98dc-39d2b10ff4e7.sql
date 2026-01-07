-- Fix 1: Add DELETE policies to vault_invitations table
-- Allow vault creators to delete invitations for their vaults
CREATE POLICY "Vault creators can delete invitations"
ON public.vault_invitations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.vaults
    WHERE vaults.id = vault_invitations.vault_id
    AND vaults.created_by = auth.uid()
  )
);

-- Allow invitees to delete their own invitations (decline)
CREATE POLICY "Invitees can delete their invitations"
ON public.vault_invitations
FOR DELETE
USING (
  invited_email = public.get_current_user_email()
);

-- Fix 2: Update get_current_user_email to query auth.users directly
-- This removes the need to store email in profiles table
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

-- Update handle_new_user trigger to not insert email anymore
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$function$;

-- Remove email column from profiles table (no longer needed)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;