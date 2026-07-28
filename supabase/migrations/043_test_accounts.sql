-- Mark accounts created solely for automated E2E tests.
-- Filtered out of all member-listing queries so they never appear
-- in the trombinoscope, map, admin member list, dashboard stats, or audit log.
ALTER TABLE members
  ADD COLUMN is_test_account boolean NOT NULL DEFAULT false;
