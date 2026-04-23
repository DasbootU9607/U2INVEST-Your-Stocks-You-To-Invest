# Deploy U2INVEST To Render Without A Card

Use this path if Render asks you for a payment method when creating the paid Blueprint.

This free setup is for demo use only:

- The service can sleep after inactivity.
- Local files are not persistent.
- Session data, SQLite checkpoints, vector cache, and model cache can be lost on restart or redeploy.

## Files

- `render.yaml`: paid, production-oriented Render setup with a persistent disk.
- `render-free.yaml`: free Render setup without a persistent disk.

## What To Use In Render

1. Open Render Dashboard.
2. Click `New` -> `Blueprint`.
3. Connect this GitHub repository.
4. In `Blueprint Path`, enter `render-free.yaml`.
5. Set the branch to `main`.
6. Set `DEEPSEEK_API_KEY`.
7. Keep the generated `FLASK_SECRET_KEY` unless you want to override it.
8. Deploy.

## What To Expect

- `/api/health` should return `status: ok`.
- `/` should load the marketing site.
- `/app/chat` should load the chat app.
- This free config already limits background playback to the smallest video files to reduce stalls on low-cost hosting.
- If the service has been idle for a while, the first request can be slow because the free instance may need to wake up.

## When To Switch Back

Move back to `render.yaml` when you want:

- persistent storage
- a backend that stays warm
- more reliable response times
- safer migration to TradingAgents
