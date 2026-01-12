-- Add email_unsubscribed column for guest purchasers who don't have a profile
ALTER TABLE vault_starter_purchases 
ADD COLUMN IF NOT EXISTS email_unsubscribed boolean NOT NULL DEFAULT false;