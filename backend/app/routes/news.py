from fastapi import APIRouter
from app.db.queries import db_delete_news_expired, db_fetch_news, db_save_news
from app.services.services import get_langgraph_news

news_router = APIRouter()

@news_router.get("")
async def get_news():
    await db_delete_news_expired()

    news = await db_fetch_news()
    if news:
        pass
    else:
        news = await get_langgraph_news()
        await db_save_news(news)

    
    response = { k: {
            "personaId": v.persona_id,
            "title": v.title,
            "category": v.category,
            "published": v.published,
            "source": v.source,
            "newsUrl": v.news_url,
            "content": v.content,
        }
        for k, v in news.items()
    }

    return response