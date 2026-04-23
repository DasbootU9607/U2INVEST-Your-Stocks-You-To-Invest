# Deploy U2INVEST To Hugging Face Spaces

Use this if you want a second free demo deployment outside Render.

## What This Path Is Good For

- quick public demo
- Docker-based deployment
- simple secret management in the Space settings

## What This Path Does Not Fix By Itself

- free Spaces can still sleep when idle
- storage is still ephemeral on free hardware
- large background videos still need filtering or compression

## Files Prepared For This

- `Dockerfile`
- `HUGGINGFACE_SPACE_README.md`

## Steps

1. Create a new Hugging Face Space.
2. Choose `Docker` as the SDK.
3. Create the Space repo.
4. Copy the contents of `HUGGINGFACE_SPACE_README.md` into the root `README.md` of the Space repo.
5. Push this project into that Space repo.
6. In the Space settings, add these secrets:
   - `DEEPSEEK_API_KEY`
   - `FLASK_SECRET_KEY`
7. In the Space settings, add these variables:
   - `PORT=7860`
   - `TRUST_PROXY_HEADERS=true`
   - `SESSION_COOKIE_SECURE=true`
   - `SESSION_COOKIE_SAMESITE=Lax`
   - `BACKGROUND_VIDEO_MAX_MB=8`
   - `BACKGROUND_VIDEO_MAX_COUNT=4`
8. Wait for the build to finish.
9. Test:
   - `/api/health`
   - `/`
   - `/app/chat`

## Notes

- The current Dockerfile now defaults to port `7860`, which matches a standard Docker Space setup.
- Render still works because Render explicitly sets `PORT=10000`.
