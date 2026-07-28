-- Prevent authenticated users from self-updating privileged columns directly
-- via the Supabase anon key. Admin operations use service_role which bypasses
-- RLS; this trigger targets only authenticated-role requests.
-- Columns blocked: role (already covered by RLS WITH CHECK), bureau_role,
-- voice_part_id (admin assigns pupitres), activated.

CREATE OR REPLACE FUNCTION prevent_member_privilege_escalation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF current_setting('request.jwt.role', true) = 'authenticated' THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Permission denied: cannot modify role';
    END IF;
    IF NEW.bureau_role IS DISTINCT FROM OLD.bureau_role THEN
      RAISE EXCEPTION 'Permission denied: cannot modify bureau_role';
    END IF;
    IF NEW.voice_part_id IS DISTINCT FROM OLD.voice_part_id THEN
      RAISE EXCEPTION 'Permission denied: cannot modify voice_part_id';
    END IF;
    IF NEW.activated IS DISTINCT FROM OLD.activated THEN
      RAISE EXCEPTION 'Permission denied: cannot modify activated';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_member_column_restrictions
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION prevent_member_privilege_escalation();
