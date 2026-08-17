-- ==============================================================================
-- RUN THIS IN SUPABASE SQL EDITOR TO FIX THE 500 RLS RECURSION ERROR IMMEDIATELY
-- ==============================================================================

-- 1. Disable RLS temporarily to clean up
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inquiries DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies on profiles
DO $$ 
DECLARE 
    pol RECORD;
BEGIN 
    FOR pol IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles') 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname); 
    END LOOP; 
END $$;

-- 3. Drop ALL existing policies on events
DO $$ 
DECLARE 
    pol RECORD;
BEGIN 
    FOR pol IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events') 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.events', pol.policyname); 
    END LOOP; 
END $$;

-- 4. Drop ALL existing policies on inquiries
DO $$ 
DECLARE 
    pol RECORD;
BEGIN 
    FOR pol IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'inquiries') 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.inquiries', pol.policyname); 
    END LOOP; 
END $$;

-- 5. Create a Security Definer function that avoids all recursion
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

-- 6. Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 7. Create Clean, Non-Recursive Policies

-- PROFILES: Users can view and update their own profile; anyone authenticated can read profiles
CREATE POLICY "Allow authenticated read profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Allow users insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- EVENTS: Public read, Admin write
CREATE POLICY "Public read events"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Admin insert events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() OR (auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY "Admin update events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (public.is_admin() OR (auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY "Admin delete events"
  ON public.events FOR DELETE
  TO authenticated
  USING (public.is_admin() OR (auth.jwt() ->> 'role') = 'service_role');

-- INQUIRIES: Public insert, Admin read/write
CREATE POLICY "Public insert inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin select inquiries"
  ON public.inquiries FOR SELECT
  TO authenticated
  USING (public.is_admin() OR (auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY "Admin update inquiries"
  ON public.inquiries FOR UPDATE
  TO authenticated
  USING (public.is_admin() OR (auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY "Admin delete inquiries"
  ON public.inquiries FOR DELETE
  TO authenticated
  USING (public.is_admin() OR (auth.jwt() ->> 'role') = 'service_role');

-- Ensure all profiles have their records created for existing auth users
INSERT INTO public.profiles (id, email, role, full_name)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'role', 'admin') AS role,
  raw_user_meta_data->>'full_name' AS full_name
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET role = 'admin';

-- ==============================================================================
-- 8. STORAGE BUCKET FOR EVENT POSTERS & IMAGES
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

