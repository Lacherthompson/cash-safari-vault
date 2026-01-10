-- Add reminder tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stuck_reminder_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add reminder tracking to vault_starter_purchases table  
ALTER TABLE public.vault_starter_purchases
ADD COLUMN IF NOT EXISTS stuck_reminder_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for efficient querying of users who need reminders
CREATE INDEX IF NOT EXISTS idx_profiles_reminder_check 
ON public.profiles (created_at, stuck_reminder_sent_at) 
WHERE stuck_reminder_sent_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_purchases_reminder_check 
ON public.vault_starter_purchases (purchased_at, stuck_reminder_sent_at) 
WHERE stuck_reminder_sent_at IS NULL;