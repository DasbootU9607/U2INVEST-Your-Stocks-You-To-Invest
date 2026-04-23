FROM node:20-alpine AS frontend-builder

WORKDIR /frontend
COPY ["ui improvement/package.json", "ui improvement/package-lock.json", "./"]
RUN npm ci

COPY ["ui improvement", "/frontend"]
COPY ["video", "/video"]
COPY ["contact", "/contact"]

ENV VITE_BASE_PATH=/
RUN npm run build


FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=7860 \
    FLASK_DEBUG=false \
    DATA_DIR=/app/data \
    CHECKPOINTS_DB_PATH=/app/data/checkpoints.sqlite \
    CHROMA_DB_DIR=/app/data/chroma_db \
    HF_HOME=/app/data/hf-home \
    SENTENCE_TRANSFORMERS_HOME=/app/data/sentence-transformers

WORKDIR /app

RUN useradd -m -u 1000 appuser

COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .
COPY --from=frontend-builder ["/frontend/dist", "/app/ui improvement/dist"]

RUN mkdir -p /app/data /app/knowledge /app/video /app/contact && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 7860

CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-7860} --workers ${GUNICORN_WORKERS:-2} --threads ${GUNICORN_THREADS:-4} --timeout ${GUNICORN_TIMEOUT:-180} web_app:app"]
