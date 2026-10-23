from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.queries import lifespan
from app.routes.news import news_router
from app.routes.scraps import scraps_router
from app.routes.account import account_router


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(news_router, prefix="/news", tags=["news"])
app.include_router(scraps_router, prefix="/scraps", tags=["scraps"])
app.include_router(account_router, prefix="/account", tags=["account"])
