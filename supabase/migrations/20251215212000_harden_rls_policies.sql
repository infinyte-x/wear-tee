-- Migration: Harden RLS policies for admin-only tables
-- This ensures sensitive tables are properly protected

-- ============================================================
-- user_roles: Only admins can read/write
-- ============================================================
DROP POLICY IF EXISTS "Admin manage roles" ON user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;

-- Admins can do everything with roles
CREATE POLICY "Admin full access to roles" ON user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Users can read their own role (needed for frontend role check)
CREATE POLICY "Users read own role" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- admin_invites: Only admins can manage invites
-- ============================================================
DROP POLICY IF EXISTS "Admin manage invites" ON admin_invites;
DROP POLICY IF EXISTS "Anyone can check invites" ON admin_invites;

-- Admins can do everything with invites
CREATE POLICY "Admin full access to invites" ON admin_invites
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can check if their email is invited (for signup flow)
CREATE POLICY "Check own invite" ON admin_invites
  FOR SELECT USING (email = auth.jwt()->>'email');

-- ============================================================
-- site_content: Public read, admin write
-- ============================================================
DROP POLICY IF EXISTS "Public read content" ON site_content;
DROP POLICY IF EXISTS "Admin write content" ON site_content;

-- Anyone can read site content
CREATE POLICY "Public read site_content" ON site_content
  FOR SELECT USING (true);

-- Only admins can modify
CREATE POLICY "Admin modify site_content" ON site_content
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin update site_content" ON site_content
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin delete site_content" ON site_content
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- discount_codes: Public can read active codes, admin CRUD
-- ============================================================
DROP POLICY IF EXISTS "Public validate codes" ON discount_codes;
DROP POLICY IF EXISTS "Admin manage codes" ON discount_codes;

-- Anyone can read active discount codes (for validation)
CREATE POLICY "Read active codes" ON discount_codes
  FOR SELECT USING (is_active = true);

-- Admins can see all codes and manage them
CREATE POLICY "Admin full access to codes" ON discount_codes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- stock_movements: Admin only (audit trail)
-- ============================================================
DROP POLICY IF EXISTS "Admin read stock" ON stock_movements;
DROP POLICY IF EXISTS "Admin write stock" ON stock_movements;

-- Admins can read all stock movements
CREATE POLICY "Admin read stock_movements" ON stock_movements
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert stock movements
CREATE POLICY "Admin insert stock_movements" ON stock_movements
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- No update/delete - immutable audit trail
