-- Add INSERT policy to vault_milestone_emails to block direct user inserts
-- This table should only be written to by edge functions using service role key
CREATE POLICY "Block direct user inserts to milestone emails"
ON public.vault_milestone_emails
FOR INSERT
TO authenticated
WITH CHECK (false);