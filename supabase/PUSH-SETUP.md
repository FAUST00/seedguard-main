# Closed-app Web Push — final 2 steps

Everything else is done and shipped:
- VAPID keypair generated (private key in `vapid-private-key.local.txt`, git-ignored)
- Public key wired into the GitHub Actions build (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`) → clients now subscribe and rows land in `public.push_subscriptions`
- Edge Function written: `supabase/functions/send-push/index.ts`
- DB trigger written: `supabase/push-trigger.sql`
- `push_subscriptions` table already created in the database

These last two need a Supabase **access token** (to deploy) and entering the
**private key** as a secret — actions the assistant can't perform for you.
Each is a copy-paste:

## Step 1 — Deploy the Edge Function + set its secrets

```bash
# one-time
npm i -g supabase
supabase login                         # opens browser, authorizes the CLI
supabase link --project-ref earfjshpbwcnpqinrrvl

# set the secrets (values are in vapid-private-key.local.txt)
supabase secrets set \
  VAPID_PUBLIC_KEY=BDVc4k_hUGIuFZXs0fqgDaY0XE0FzIa_WYKsJ5eCVwh-YJX2KCyTGFb5SFMkfFsXiU_gyKm-iuyqj2guomzd8mM \
  VAPID_PRIVATE_KEY=<paste private key from vapid-private-key.local.txt> \
  VAPID_SUBJECT=mailto:fausto.fgj@gmail.com

# deploy (no JWT check — it's called internally by the DB trigger)
supabase functions deploy send-push --no-verify-jwt
```

## Step 2 — Install the trigger

In the Supabase SQL Editor, run **`supabase/push-trigger.sql`**.

## Done — how to verify
1. On your phone/desktop: open SeedGuard → Settings → enable **Browser Notifications**.
2. Fully close the tab/app.
3. From another account, send a DM or an accountability **Nudge**.
4. A push notification should arrive even with the app closed.

(Foreground notifications — app open — already work without any of this.)
