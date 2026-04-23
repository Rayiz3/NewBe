import os

from dotenv import load_dotenv

load_dotenv()

class Config:
    MAX_CNT_PER_CAT: int = 1
    
    BATCH_SIZE: int = 10

    # LLM
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY")
    MODEL: str = "claude-haiku-4-5-20251001"
    MAX_TOKENS: str = 2048

    # Concurrency
    SEMA_COLLECT: int = 8
    SEMA_SUMMARIZE: int = 5

    # DB
    TTL: int = 30