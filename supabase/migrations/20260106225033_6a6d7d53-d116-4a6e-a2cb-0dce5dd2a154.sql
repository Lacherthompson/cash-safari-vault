-- Add accent_color column to vaults table
ALTER TABLE public.vaults 
ADD COLUMN accent_color TEXT DEFAULT 'emerald';