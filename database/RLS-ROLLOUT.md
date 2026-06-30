# RLS security rollout

Apply these steps to the production Supabase project in this exact order.

1. Open Supabase SQL Editor and run `database/audit-active-rls.sql`.
2. Confirm that `privileged_profiles` is at least `1`.
3. Export or capture the policy results as a rollback reference.
4. Run `database/migrations/2026-06-30-harden-member-rls.sql`.
5. Run `database/audit-active-rls.sql` again and confirm no broad `using (true)` management policy remains.
6. Run `database/migrations/2026-06-30-add-safe-community-directory.sql` to restore limited birthday and segment visibility without exposing full profiles.

## Required acceptance tests

- Admin/pastor: dashboard and all people load; permissions and approvals can be edited.
- Leader: only scoped people load; scoped people and pastoral tasks can be edited.
- Member: only the linked personal record loads and can be updated.
- Member: changing status, leadership assignment, roles, or approval state is rejected.
- Anonymous visitor/member form: a consented pending visitor can be submitted.
- Anonymous clients cannot read people, profiles, scopes, tasks, interactions, or attendance.

## Important compatibility note

The member, leader, and segment pages use limited-data RPCs for global birthdays and shared department/family-group contacts. Full profile rows remain protected by RLS.
