import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.getenv("DATA_DIR", ROOT_DIR / "data")).resolve()
CHECKPOINTS_DB_PATH = Path(
    os.getenv("CHECKPOINTS_DB_PATH", DATA_DIR / "checkpoints.sqlite")
).resolve()
CHROMA_DB_DIR = Path(os.getenv("CHROMA_DB_DIR", DATA_DIR / "chroma_db")).resolve()
KNOWLEDGE_BASE_PATH = Path(
    os.getenv("KNOWLEDGE_BASE_PATH", ROOT_DIR / "knowledge")
).resolve()
HF_HOME = Path(os.getenv("HF_HOME", DATA_DIR / "hf-home")).resolve()
SENTENCE_TRANSFORMERS_HOME = Path(
    os.getenv("SENTENCE_TRANSFORMERS_HOME", DATA_DIR / "sentence-transformers")
).resolve()


def ensure_runtime_dirs():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    CHECKPOINTS_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    CHROMA_DB_DIR.mkdir(parents=True, exist_ok=True)
    KNOWLEDGE_BASE_PATH.mkdir(parents=True, exist_ok=True)
    HF_HOME.mkdir(parents=True, exist_ok=True)
    SENTENCE_TRANSFORMERS_HOME.mkdir(parents=True, exist_ok=True)

    os.environ.setdefault("HF_HOME", str(HF_HOME))
    os.environ.setdefault("SENTENCE_TRANSFORMERS_HOME", str(SENTENCE_TRANSFORMERS_HOME))


ensure_runtime_dirs()
