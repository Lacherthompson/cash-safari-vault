-- Add DELETE policies for user_settings and vault_milestone_emails
-- This allows users to delete their own records (GDPR compliance)

-- Users can delete their own settings
CREATE POLICY "Users can delete their own settings"
ON public.user_settings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own milestone email records
CREATE POLICY "Users can delete their own milestone emails"
ON public.vault_milestone_emails
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);