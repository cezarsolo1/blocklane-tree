# Supabase Setup (Run in Dashboard)

1) Open Supabase → SQL Editor → paste the contents of `/supabase/migrations/2025-08-21_init.sql` → Run.
2) Verify in Table Editor:
   - Tables: `profiles`, `tickets` exist, RLS enabled.
   - Policies appear as listed.
3) Verify in Storage:
   - Bucket `ticket-photos` exists and is PRIVATE.
4) Test a sign-up from the app and ensure a `profiles` row is created/updated for the user (if you upsert it in app code).
5) Photo uploads must use the path: `${auth.uid}/tickets/${ticketId or timestamp}/filename`.
6) Display photos using `createSignedUrl` (private bucket; do not make it public).