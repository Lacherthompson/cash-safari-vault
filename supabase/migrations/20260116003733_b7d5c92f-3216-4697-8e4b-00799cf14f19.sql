-- Create table to track milestone emails sent to users
CREATE TABLE public.vault_milestone_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  milestone INTEGER NOT NULL, -- 25, 50, 75, or 100
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vault_id, user_id, milestone)
);

-- Enable RLS
ALTER TABLE public.vault_milestone_emails ENABLE ROW LEVEL SECURITY;

-- Users can view their own milestone emails
CREATE POLICY "Users can view their own milestone emails"
ON public.vault_milestone_emails
FOR SELECT
USING (auth.uid() = user_id);

-- Index for efficient querying
CREATE INDEX idx_vault_milestone_emails_vault_user ON public.vault_milestone_emails(vault_id, user_id);