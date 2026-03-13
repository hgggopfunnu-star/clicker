-- Create profiles table with leaderboard data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  score BIGINT DEFAULT 0,
  coins BIGINT DEFAULT 0,
  level INTEGER DEFAULT 1,
  xp BIGINT DEFAULT 0,
  multiplier INTEGER DEFAULT 1,
  auto_clickers INTEGER DEFAULT 0,
  owned_items TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the leaderboard (scores)
CREATE POLICY "profiles_select_all" ON public.profiles 
  FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Users can delete their own profile  
CREATE POLICY "profiles_delete_own" ON public.profiles 
  FOR DELETE USING (auth.uid() = id);

-- Create index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_score ON public.profiles (score DESC);
