# Closed-app Web Push — status

**Almost entirely done.** What's already live:
- VAPID keypair generated (private key in `vapid-private-key.local.txt`, git-ignored)
- Public key wired into the GitHub Actions build (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`) → clients subscribe; rows land in `public.push_subscriptions`
- **Edge Function `send-push` deployed** (via the dashboard) with **Verify JWT = off**
- Function secrets **`VAPID_PUBLIC_KEY`** and **`VAPID_SUBJECT`** set
- **DB trigger installed** (`trg_push_on_message`) → calls the function on every new message/nudge
  - Function URL: `https://earfjshpbwcnpqinrrvl.supabase.co/functions/v1/send-push`

## The only remaining step — set the private key (you do this)

The assistant can't enter a secret signing key into a field. One paste:

1. Supabase → Edge Functions → **Secrets**
2. Name: `VAPID_PRIVATE_KEY`  ·  Value: the `VAPID_PRIVATE_KEY` from `vapid-private-key.local.txt`
3. **Save**

## Verify
1. On a device: SeedGuard → Settings → enable **Browser Notifications**.
2. Close the tab/app.
3. From another account, send a DM or an accountability **Nudge**.
4. A push notification should arrive even with the app closed.
   (Function logs: Supabase → Edge Functions → send-push → Logs.)

Foreground notifications (app open) already work without any of this.
