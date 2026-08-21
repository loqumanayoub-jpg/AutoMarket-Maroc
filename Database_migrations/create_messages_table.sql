-- Migration: create messages table
-- Safe creation; does not modify existing tables.
BEGIN;

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  phone text,
  brand text,
  model text,
  year integer,
  price numeric,
  fuel text,
  transmission text,
  mileage integer,
  city text,
  description text,
  images text[],
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

-- NOTE: Row Level Security (RLS) policies are not created by this migration.
-- If RLS is enabled on your Supabase project, create a policy to allow
-- authenticated or anonymous inserts as appropriate. Example:
--
-- ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow anonymous insert for messages"
--   ON public.messages FOR INSERT
--   USING (true)
--   WITH CHECK (true);
--
-- Review and tighten policies before applying to production.

COMMIT;
