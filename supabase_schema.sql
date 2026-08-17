-- ==============================================================================
-- UNAI EVENTS & THEATRE - SUPABASE DATABASE SCHEMA (OPTIMIZED & RECURSION-SAFE)
-- Copy and run this script in your Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. USER ROLES & PROFILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Security Definer function to check if the current user is an admin without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Drop any old policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own or admin" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Clean Non-Recursive Policies on profiles
CREATE POLICY "Users can view own or admin"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

-- Function to handle new user signup automatically creating a profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 3. EVENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY DEFAULT ('unai-' || substr(uuid_generate_v4()::text, 1, 8)),
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('Concert', 'Comedy', 'Theatre', 'Workshop', 'Dance', 'Festival')),
  date DATE NOT NULL,
  display_date JSONB NOT NULL DEFAULT '{"month":"AUG","day":"28","time":"8:00 PM","year":"2026"}'::jsonb,
  time TEXT NOT NULL DEFAULT '8:00 PM',
  duration TEXT DEFAULT '120 Mins',
  language TEXT DEFAULT 'English',
  age_limit TEXT DEFAULT 'All Ages',
  venue TEXT NOT NULL,
  city TEXT NOT NULL,
  price_starting TEXT NOT NULL DEFAULT '₹499',
  image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  bookmyshow_url TEXT NOT NULL,
  featured BOOLEAN DEFAULT true,
  hero_spotlight BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Booking Open',
  description TEXT DEFAULT '',
  highlights JSONB DEFAULT '[]'::jsonb,
  ticket_tiers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop old policies on events
DROP POLICY IF EXISTS "Public can view events" ON public.events;
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;

-- Clean Policies on events
CREATE POLICY "Public can view events"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert events"
  ON public.events FOR INSERT
  WITH CHECK (public.is_admin() OR (auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY "Admins can update events"
  ON public.events FOR UPDATE
  USING (public.is_admin() OR (auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY "Admins can delete events"
  ON public.events FOR DELETE
  USING (public.is_admin() OR (auth.jwt() ->> 'role') = 'service_role');

-- ==============================================================================
-- 4. INQUIRIES / CONTACT TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_type TEXT DEFAULT 'Auditorium Booking',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'New' CHECK (status IN ('New', 'In Review', 'Replied', 'Archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on inquiries
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Drop old policies on inquiries
DROP POLICY IF EXISTS "Anyone can submit inquiry" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can view inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can update inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can delete inquiries" ON public.inquiries;

-- Clean Policies on inquiries
CREATE POLICY "Anyone can submit inquiry"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view inquiries"
  ON public.inquiries FOR SELECT
  USING (public.is_admin() OR (auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY "Admins can update inquiries"
  ON public.inquiries FOR UPDATE
  USING (public.is_admin() OR (auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY "Admins can delete inquiries"
  ON public.inquiries FOR DELETE
  USING (public.is_admin() OR (auth.jwt() ->> 'role') = 'service_role');

-- ==============================================================================
-- 5. ENABLE REALTIME ON TABLES
-- ==============================================================================
-- Safely add tables to publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'inquiries'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiries;
  END IF;
END $$;

-- ==============================================================================
-- 6. STORAGE BUCKET FOR EVENT POSTERS & IMAGES
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Storage Policies: Public can view images
DROP POLICY IF EXISTS "Public view event images" ON storage.objects;
CREATE POLICY "Public view event images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-images');

-- Authenticated users can upload to event-images
DROP POLICY IF EXISTS "Allow upload to event images" ON storage.objects;
CREATE POLICY "Allow upload to event images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-images');

DROP POLICY IF EXISTS "Allow update event images" ON storage.objects;
CREATE POLICY "Allow update event images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'event-images');

DROP POLICY IF EXISTS "Allow delete event images" ON storage.objects;
CREATE POLICY "Allow delete event images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'event-images');

-- ==============================================================================
-- 7. HOW TO SET YOUR USER AS ADMIN:
-- Replace with your signed-up user's email:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
-- ==============================================================================

