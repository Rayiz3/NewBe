from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.queries import lifespan
from app.routes.news import news_router


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(news_router, prefix="/news", tags=["news"])