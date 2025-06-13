-- Create a table for public user profiles
-- IF NOT EXISTS ensures that if you run this multiple times, it won't fail if the table is already there.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at TIMESTAMPTZ,
  full_name TEXT,
  company_name TEXT,
  plan TEXT DEFAULT 'starter',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  avatar_url TEXT
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to profiles (e.g., for avatars, names)
-- You might want to restrict this further depending on your app's privacy needs.
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (TRUE);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- This function handles creating a profile entry when a new user signs up.
-- It reads metadata passed during the supabase.auth.signUp() call.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Allows the function to operate with the permissions of the user who defined it (usually admin)
SET search_path = public -- Ensures the function knows where to find the 'profiles' table
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, company_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- This trigger calls the handle_new_user function after a new user is inserted into auth.users.
-- Drop the trigger first if it exists to prevent errors on re-running the script.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
