-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Vaults table (savings goals)
CREATE TABLE public.vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'My Vault',
  goal_amount INTEGER NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vaults ENABLE ROW LEVEL SECURITY;

-- Vault members (for shared vaults)
CREATE TABLE public.vault_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vault_id, user_id)
);

ALTER TABLE public.vault_members ENABLE ROW LEVEL SECURITY;

-- Vault amounts (the grid of numbers to check off)
CREATE TABLE public.vault_amounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  is_checked BOOLEAN NOT NULL DEFAULT false,
  checked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vault_amounts ENABLE ROW LEVEL SECURITY;

-- Vault invitations
CREATE TABLE public.vault_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vault_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vaults
CREATE POLICY "Users can view vaults they are members of" ON public.vaults
  FOR SELECT USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM public.vault_members WHERE vault_id = id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create vaults" ON public.vaults
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Vault creators can update their vaults" ON public.vaults
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Vault creators can delete their vaults" ON public.vaults
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for vault_members
CREATE POLICY "Users can view vault members for their vaults" ON public.vault_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.vaults WHERE id = vault_id AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.vault_members vm WHERE vm.vault_id = vault_id AND vm.user_id = auth.uid())))
  );

CREATE POLICY "Vault creators can add members" ON public.vault_members
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.vaults WHERE id = vault_id AND created_by = auth.uid())
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can remove themselves from vaults" ON public.vault_members
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for vault_amounts
CREATE POLICY "Users can view their own amounts" ON public.vault_amounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view amounts from shared vault members" ON public.vault_amounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.vault_members vm 
      WHERE vm.vault_id = vault_id AND vm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own amounts" ON public.vault_amounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own amounts" ON public.vault_amounts
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for vault_invitations
CREATE POLICY "Users can view invitations for their vaults" ON public.vault_invitations
  FOR SELECT USING (
    auth.uid() = invited_by OR
    invited_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Vault members can create invitations" ON public.vault_invitations
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.vaults WHERE id = vault_id AND created_by = auth.uid())
  );

CREATE POLICY "Invitees can update invitation status" ON public.vault_invitations
  FOR UPDATE USING (
    invited_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );