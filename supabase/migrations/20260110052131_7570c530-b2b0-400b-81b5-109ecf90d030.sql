-- Add email unsubscribe tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN email_unsubscribed boolean NOT NULL DEFAULT false;

-- Add index for efficient filtering
CREATE INDEX idx_profiles_email_unsubscribed ON public.profiles(email_unsubscribed);