-- Migration 019 created a temporary RLS policy "Members can read public view"
-- with `using (true)` to test a members_public view. The view was dropped in
-- the same migration but the policy was never removed. PostgreSQL ORs permissive
-- SELECT policies, so this effectively bypassed all column-level visibility rules
-- and exposed the full members table to any authenticated user.
DROP POLICY IF EXISTS "Members can read public view" ON members;
