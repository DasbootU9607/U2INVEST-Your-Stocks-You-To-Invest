# Deploy U2INVEST To Render

This repo is now prepared to run as a single Render web service:

- Flask API
- Built React frontend
- Video assets
- Persistent storage for SQLite, Chroma, and model cache

## What Is Already Prepared

- `Dockerfile` builds the React frontend and serves the full app with Flask + Gunicorn.
- `render.yaml` defines a Render web service with a persistent disk and health check.
- Runtime paths are configurable through environment variables.
- The knowledge base retriever now initializes lazily so the app starts faster.

## What You Need To Do

1. Push the latest repo state to GitHub.
2. Create a Render account and connect your GitHub account.
3. In Render, create a new Blueprint or Web Service from this repository.
4. If you use the Blueprint flow, Render will read `render.yaml` automatically.
5. When prompted for secrets, set:
   - `DEEPSEEK_API_KEY`
   - optionally replace `FLASK_SECRET_KEY` if you do not want the generated value
6. Confirm the persistent disk mount path is `/app/data`.
7. Deploy.
8. After deploy finishes, open:
   - `/api/health`
   - `/`
   - `/app/chat`

## If Render Asks For A Payment Method

Use `render-free.yaml` instead of `render.yaml`.

That free option removes the persistent disk and changes the service to a free instance so you can test the full app without adding a card. See `DEPLOY_RENDER_FREE.md` for the exact steps.

## Recommended First Production Check

Verify these items before changing the agent implementation:

- The home page loads from the Render URL.
- `GET /api/health` returns `"status": "ok"`.
- The contact page works.
- The Trading Lab loads.
- U2CHAT returns a response when `DEEPSEEK_API_KEY` is set.

## Local Docker Test

1. Copy `.env.example` to `.env`.
2. Fill in `FLASK_SECRET_KEY` and `DEEPSEEK_API_KEY`.
3. Run:

```bash
docker compose up --build
```

4. Open:

```text
http://localhost:5000
http://localhost:5000/api/health
```

## After The Site Is Live

Do this next:

1. Add your custom domain in Render.
2. Verify DNS and HTTPS.
3. Test the app again on the custom domain.
4. Only after the current backend is stable, start replacing the current agent with TradingAgents behind the existing `/api/agent/*` routes.

## TradingAgents Migration Strategy

Keep the public API stable and swap the backend implementation in phases:

1. Keep the current frontend unchanged.
2. Keep `/api/agent/chat`, `/api/agent/sessions`, and `/api/agent/history`.
3. Replace the internals of `agent_graph.py` with a TradingAgents-backed adapter.
4. Compare latency, token cost, and output quality before fully switching.
