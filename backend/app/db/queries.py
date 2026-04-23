from contextlib import asynccontextmanager
import os
import asyncpg
from datetime import date, datetime, timedelta
from dotenv import load_dotenv
from fastapi import FastAPI
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime

from app.services.services import get_langgraph_news
from app.core.configs import Config
from app.db.schemas import SummaryResponseSchema


load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
pool = None

# scheduling for daily task #

scheduler = AsyncIOScheduler(timezone="Asia/Seoul")

async def daily_news_job():
    print(f"[Scheduler] running daily job at {datetime.today().strftime("%Y-%m-%d %H:%M:%S")}...")
    await db_delete_news_expired()
    news = await get_langgraph_news()
    await db_save_news(news)
    print(f"[Scheduler] daily job done.")

def start_scheduler():
    scheduler.add_job(
        daily_news_job,
        trigger="cron",
        hour=2,
        minute=0
    )
    scheduler.start()

''' create multiple connections(pool) with DB '''
async def get_pool() -> asyncpg.Pool:
    global pool

    if pool is None:
        pool = await asyncpg.create_pool(DATABASE_URL, statement_cache_size=0)
    
    return pool

''' shout down the pool '''
async def close_pool() -> None:
    global pool

    if pool:
        await pool.close()
        pool = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    await get_pool()
    print("Database pool initialized")

    start_scheduler()
    
    yield  # FastAPI runs the app at here
    
    # --- Shutdown ---
    await close_pool()
    print("Database pool closed")

''' get summary news from db and return as dict '''
async def db_fetch_news() -> dict[str, SummaryResponseSchema]:
    today = date.today()

    pool = await get_pool()

    query = """
    SELECT persona_id, title, category, published, source, news_url, content
    FROM summaries
    WHERE published = $1
    """

    async with pool.acquire() as conn:
        rows = await conn.fetch(query, today)
        print("[DB] fetching completed")

    return { row["persona_id"]:
        SummaryResponseSchema(
            persona_id=row["persona_id"],
            title=row["title"],
            category=row["category"],
            published=row["published"].isoformat(),
            source=row["source"],
            news_url=row["news_url"],
            content=row["content"]
            )
        for row in rows
    }

async def db_save_news(news: dict[str, SummaryResponseSchema]) -> None:
    pool = await get_pool()

    query = """
    INSERT INTO summaries (persona_id, title, category, published, source, news_url, content)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (published, persona_id)
    DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        source = EXCLUDED.source,
        news_url = EXCLUDED.news_url,
        content = EXCLUDED.content
    """

    values = [(item.persona_id,
               item.title,
               item.category,
               datetime.fromisoformat(item.published).date(),
               item.source,
               item.news_url,
               item.content,
               ) for item in news.values()]

    async with pool.acquire() as conn:
        async with conn.transaction():  # atomicity
            await conn.executemany(query, values)  # bulk execution
        print("[DB] upload completed")

''' delete expired news from db '''
async def db_delete_news_expired() -> None:
    pool = await get_pool()

    cutoff_day = date.today() - timedelta(days=Config.TTL)

    query = """
    DELETE
    FROM summaries
    WHERE published < $1
    """

    async with pool.acquire() as conn:
        rows = await conn.fetch(query, cutoff_day)
        print("[DB] remove expired data completed")
    return