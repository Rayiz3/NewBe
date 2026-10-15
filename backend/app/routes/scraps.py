import base64
import binascii
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field

from app.core.auth import current_user
from app.db.scraps import delete_scraps, list_scraps, save_scrap, scrap_status

scraps_router = APIRouter()


class SaveScrap(BaseModel):
    model_config = ConfigDict(extra="forbid")
    summary_id: UUID = Field(alias="summaryId")


class DeleteScraps(BaseModel):
    model_config = ConfigDict(extra="forbid")
    ids: list[UUID] = Field(min_length=1, max_length=100)


class ScrapStatusRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    summary_ids: list[UUID] = Field(alias="summaryIds", min_length=1, max_length=100)


@scraps_router.post("/status")
async def get_scrap_status(body: ScrapStatusRequest, user_id: UUID = Depends(current_user)):
    return {"items": await scrap_status(user_id, list(set(body.summary_ids)))}


class Scrap(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: UUID
    summary_id: UUID = Field(alias="summaryId")
    persona_id: str = Field(alias="personaId")
    title: str
    content: str
    news_url: str = Field(alias="newsUrl")
    source: str
    category: str
    saved_at: datetime = Field(alias="savedAt")


class ScrapPage(BaseModel):
    items: list[Scrap]
    next_cursor: str | None = Field(alias="nextCursor")


def encode_cursor(row):
    return base64.urlsafe_b64encode(f'{row["saved_at"].isoformat()}|{row["id"]}'.encode()).decode()


def decode_cursor(cursor):
    try:
        timestamp, identifier = base64.b64decode(cursor, altchars=b'-_', validate=True).decode().split('|')
        date = datetime.fromisoformat(timestamp)
        if date.tzinfo is None:
            raise ValueError("Timezone required")
        return date, UUID(identifier)
    except (ValueError, UnicodeError, binascii.Error):
        raise HTTPException(422, "Invalid cursor") from None


@scraps_router.post("", response_model=Scrap)
async def create_scrap(body: SaveScrap, user_id: UUID = Depends(current_user)):
    row = await save_scrap(user_id, body.summary_id)
    if row is None:
        raise HTTPException(404, "Summary expired or changed; reload the news")
    return row


@scraps_router.get("", response_model=ScrapPage)
async def get_scraps(limit: int = Query(20, ge=1, le=100),
                     cursor: str | None = Query(None, max_length=256),
                     user_id: UUID = Depends(current_user)):
    rows = await list_scraps(user_id, limit, decode_cursor(cursor) if cursor else None)
    return {"items": rows[:limit],
            "nextCursor": encode_cursor(rows[limit - 1]) if len(rows) > limit else None}


@scraps_router.post("/batch-delete")
async def batch_delete(body: DeleteScraps, user_id: UUID = Depends(current_user)):
    deleted = await delete_scraps(user_id, list(set(body.ids)))
    return {"deletedIds": deleted, "deletedCount": len(deleted)}
