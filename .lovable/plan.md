# Security Cleanup — Next Phase

Verified current state before planning (queried `pg_policies`, `pg_publication_tables`, function privileges).

## What I found

- **`user_roles` realtime**: the `supabase_realtime` publication currently contains **no tables at all**. Nothing is broadcast, so this "critical" finding is not reproducible against the live database. I'll still add a defensive `realtime.messages` policy and then mark the finding resolved.
- **Orders**: `INSERT` policy is `WITH CHECK (auth.uid() = user_id)` on role `public`, and `user_id` is nullable. Guest orders can't actually be created (NULL = NULL fails), but the policies target `public` rather than `authenticated`, and guest checkout has no readable path.
- **Storage `product-images`**: INSERT/UPDATE/DELETE are admin-only, while creators can insert products — so creators genuinely cannot upload product imagery. Also the SELECT policy is bucket-wide, which allows listing every object.
- **SECURITY DEFINER functions**: 9 functions in `public` are executable by `anon`/`authenticated`. Only `has_role` needs to stay callable (it's used inside policies). Trigger functions and `log_admin_action` should not be directly callable.
- **Always-true policies**: write policies with `WITH CHECK (true)` exist on `events`, `newsletter_subscribers`, `notify_requests`, `qr_scans`. These are intentional public-write endpoints, but they can be tightened with column/shape constraints instead of blanket `true`.
- **Leaked password protection**: an Auth dashboard setting, not something a migration can change.

## Plan

### 1. Migration — orders
- Make `orders.user_id` `NOT NULL` (after confirming no NULL rows exist) so ownership is always enforced.
- Rescope orders policies from `public` to `authenticated`.

### 2. Migration — storage policies
- Add an INSERT/UPDATE/DELETE policy on `product-images` for users holding the `creator` role, scoped to a `creators/<auth.uid()>/` path prefix; keep admin full access.
- Narrow the public SELECT policy on `product-images` and `creator-uploads` so anonymous clients can read objects but not enumerate the whole bucket (restrict to known path prefixes).

### 3. Migration — SECURITY DEFINER hardening
- `REVOKE EXECUTE ... FROM PUBLIC, anon, authenticated` on all trigger functions (`handle_new_user`, `assign_dgr_code`, `fits_likes_count_sync`, `handle_creator_application_decision`, `profiles_default_username`, `snapshot_seo_page`, `rls_auto_enable`) — triggers still run as the table owner.
- `log_admin_action`: revoke from `anon`, keep `authenticated` (it already checks `has_role(auth.uid(),'admin')` internally).
- `has_role`: keep executable — required by policies.

### 4. Migration — tighten always-true write policies
- `events`, `qr_scans`: keep public insert (analytics beacons) but restrict to `anon, authenticated` roles explicitly and add validation triggers rejecting oversized/garbage payloads.
- `newsletter_subscribers`, `notify_requests`: add a validation trigger enforcing a well-formed email and reasonable length; keep insert open, block reads (already denied).

### 5. Migration — realtime defence-in-depth
- Add RLS policies on `realtime.messages` so channel subscription requires an authenticated user, closing the flagged issue even though no table is currently published.

### 6. Code follow-ups
- Update `src/components/profile/ImageUpload.tsx` and any creator product-image upload path to write under the new allowed path prefix so the tightened storage policies don't break existing uploads.

### 7. Manual step (cannot be automated)
- **Leaked Password Protection** must be enabled by you in Supabase → Authentication → Providers → Password settings. I'll link straight to it.

### 8. Verify
- Re-run the Supabase linter and the security scanner, then mark the resolved findings as fixed with explanations, and update the security memory.

## Technical notes
All database changes go through migrations, applied one at a time so failures are isolated. No table drops or data deletion. The `orders.user_id NOT NULL` change is the only potentially breaking one — I'll query for NULL rows first and, if any exist, either backfill or skip that step and report it.
