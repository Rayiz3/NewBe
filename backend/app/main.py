import sched

from fastapi import FastAPI

from app.db.queries import lifespan
from app.routes.news import news_router

app = FastAPI(lifespan=lifespan)

app.include_router(news_router, prefix="/news", tags=["news"])