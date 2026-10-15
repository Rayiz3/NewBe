from uuid import UUID

from app.db.queries import get_pool


async def scrap_status(user_id: UUID, summary_ids: list[UUID]):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT summary_id, id FROM public.scraps
            WHERE user_id=$1 AND summary_id=ANY($2::uuid[])
        """, user_id, summary_ids)
    return [{"summaryId": row["summary_id"], "scrapId": row["id"]} for row in rows]


async def save_scrap(user_id: UUID, summary_id: UUID):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            # Also permit retrying a saved summary after its source has expired.
            existing = await conn.fetchrow(
                "SELECT * FROM public.scraps WHERE user_id=$1 AND summary_id=$2", user_id, summary_id)
            if existing:
                return dict(existing)
            row = await conn.fetchrow("""
                INSERT INTO public.scraps
                    (user_id, summary_id, persona_id, title, content, news_url, source, category)
                SELECT $1, summary_id, persona_id, title, content, news_url,
                       COALESCE(source, ''), COALESCE(category, '')
                FROM public.summaries WHERE summary_id=$2
                ON CONFLICT (user_id, summary_id) DO UPDATE
                    SET summary_id=EXCLUDED.summary_id
                RETURNING *
            """, user_id, summary_id)
            return dict(row) if row else None


async def list_scraps(user_id: UUID, limit: int, before=None):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT * FROM public.scraps
            WHERE user_id=$1
              AND ($2::timestamptz IS NULL OR (saved_at, id) < ($2, $3::uuid))
            ORDER BY saved_at DESC, id DESC LIMIT $4
        """, user_id, before[0] if before else None, before[1] if before else None, limit + 1)
    return [dict(row) for row in rows]


async def delete_scraps(user_id: UUID, ids: list[UUID]):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            DELETE FROM public.scraps WHERE user_id=$1 AND id=ANY($2::uuid[]) RETURNING id
        """, user_id, ids)
    return [row["id"] for row in rows]
