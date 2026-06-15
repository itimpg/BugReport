-- ============================================================
-- Supabase Auth Migration
-- Run this AFTER schema.sql in the Supabase SQL Editor
-- ============================================================

-- ============================================================
-- AUTH USER SYNC TRIGGER
-- Auto-creates a public.users record when someone signs in
-- via Supabase Auth (Google OAuth etc.)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, role, is_disabled)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    'User',
    FALSE
  )
  ON CONFLICT (id) DO UPDATE SET
    email        = EXCLUDED.email,
    display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), public.users.display_name);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_reports         ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_report_categories ENABLE ROW LEVEL SECURITY;

-- ── users ─────────────────────────────────────────────────────
-- Users can view themselves; admins can view everyone
CREATE POLICY "users_select" ON users FOR SELECT
  USING (
    id = auth.uid()
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'Admin')
  );

-- Only admins can update users
CREATE POLICY "users_update" ON users FOR UPDATE
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'Admin'));

-- ── categories ────────────────────────────────────────────────
CREATE POLICY "categories_select" ON categories FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "categories_insert" ON categories FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'Admin'));

CREATE POLICY "categories_update" ON categories FOR UPDATE
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'Admin'));

CREATE POLICY "categories_delete" ON categories FOR DELETE
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'Admin'));

-- ── bug_reports ───────────────────────────────────────────────
-- Users see their own non-deleted bugs; admins see all
CREATE POLICY "bugs_select" ON bug_reports FOR SELECT
  USING (
    is_deleted = FALSE
    AND (
      reported_by = auth.uid()
      OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'Admin')
    )
  );

CREATE POLICY "bugs_insert" ON bug_reports FOR INSERT
  WITH CHECK (reported_by = auth.uid());

CREATE POLICY "bugs_update" ON bug_reports FOR UPDATE
  USING (
    reported_by = auth.uid()
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'Admin')
  );

CREATE POLICY "bugs_delete" ON bug_reports FOR DELETE
  USING (
    reported_by = auth.uid()
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'Admin')
  );

-- ── bug_report_categories ─────────────────────────────────────
CREATE POLICY "bug_cats_select" ON bug_report_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bug_reports br
      WHERE br.id = bug_report_id AND br.is_deleted = FALSE
      AND (
        br.reported_by = auth.uid()
        OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'Admin')
      )
    )
  );

CREATE POLICY "bug_cats_insert" ON bug_report_categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bug_reports br
      WHERE br.id = bug_report_id
      AND (
        br.reported_by = auth.uid()
        OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'Admin')
      )
    )
  );

CREATE POLICY "bug_cats_delete" ON bug_report_categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM bug_reports br
      WHERE br.id = bug_report_id
      AND (
        br.reported_by = auth.uid()
        OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'Admin')
      )
    )
  );

-- ============================================================
-- STORAGE BUCKET POLICY (run in Supabase Storage settings or here)
-- Allow authenticated users to upload; service role to manage
-- ============================================================

-- In Supabase Dashboard > Storage > bug-images bucket:
-- Set bucket to PRIVATE
-- Add policy: authenticated users can upload to their own folder
-- API routes use service_role key, so they bypass Storage RLS
