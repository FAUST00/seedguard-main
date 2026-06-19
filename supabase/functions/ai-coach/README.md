# Recovery Coach Edge Function — manual setup

This mirrors the existing push-notification setup in `supabase/PUSH-SETUP.md`:
the code is in this repo, but a few steps must be done once in the Supabase
dashboard because they involve secrets that can never be committed to git.

## 1. Deploy the function

```
supabase functions deploy ai-coach
```

## 2. Set the function secrets

In the Supabase dashboard → Edge Functions → ai-coach → Secrets:

- `AI_API_KEY` — your OpenAI or Anthropic API key
- `AI_PROVIDER` — `openai` (default) or `anthropic`
- `AI_MODEL` — optional, defaults to `gpt-4o-mini` (OpenAI) or `claude-haiku-4-5` (Anthropic)

## 3. Point the app at the deployed URL

Add to the GitHub Actions build step (same place `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
is injected, see `.github/workflows/deploy.yml`):

```
NEXT_PUBLIC_AI_COACH_URL: https://<project-ref>.supabase.co/functions/v1/ai-coach
```

Until this env var is set, the Recovery Coach panel falls back to a static
list of crisis-support tips instead of erroring — see
`components/recovery-coach-chat.tsx`.

## Notes on Ollama / self-hosted models

Ollama cannot be a per-user, in-app toggle in a hosted multi-tenant product —
there is no safe way to expose someone's home Ollama server to this app. If
you self-host, point this Edge Function's HTTP call at your own
Ollama-compatible endpoint instead of OpenAI/Anthropic; the function's
provider switch can be extended with an `'ollama'` branch that calls your
self-hosted URL instead of a public API.
