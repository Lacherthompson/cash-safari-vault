-- Create table to track Vault Starter purchases
CREATE TABLE public.vault_starter_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  user_id UUID,
  stripe_session_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent_id TEXT,
  amount_paid INTEGER NOT NULL DEFAULT 1200,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  emails_started BOOLEAN NOT NULL DEFAULT false,
  current_email_day INTEGER NOT NULL DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE public.vault_starter_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases (by email or user_id)
CREATE POLICY "Users can view their own purchases"
ON public.vault_starter_purchases
FOR SELECT
USING (
  user_id = auth.uid() OR 
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Create index for faster lookups
CREATE INDEX idx_vault_starter_purchases_email ON public.vault_starter_purchases(email);
CREATE INDEX idx_vault_starter_purchases_stripe_session ON public.vault_starter_purchases(stripe_session_id);