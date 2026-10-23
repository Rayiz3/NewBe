"""Self-service account deletion. The admin credential never leaves the server."""
import asyncio
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response
from app.core.auth import current_user

account_router = APIRouter()


def delete_auth_user(user_id: UUID) -> None:
    url = os.getenv("SUPABASE_URL", "").rstrip("/")
    key = os.getenv("SUPABASE_SECRET_KEY", "")
    if not url.startswith("https://") or not key:
        raise HTTPException(503, "Account deletion is not configured")
    request = Request(f"{url}/auth/v1/admin/users/{user_id}", method="DELETE",
                      data=b'{"should_soft_delete":false}', headers={
                          # Secret keys are opaque API keys, not bearer JWTs.
                          "apikey": key,
                          "Content-Type": "application/json",
                      })
    try:
        with urlopen(request, timeout=15):
            pass
    except HTTPError as exc:
        # A concurrent successful deletion is also success.
        if exc.code != 404:
            raise HTTPException(503, "Account deletion unavailable; please retry") from None
    except (URLError, TimeoutError, OSError):
        raise HTTPException(503, "Account deletion unavailable; please retry") from None


@account_router.delete("", status_code=204)
async def delete_account(user_id: UUID = Depends(current_user)):
    # No client-provided user ID: only the verified bearer-token owner is deleted.
    await asyncio.to_thread(delete_auth_user, user_id)
    return Response(status_code=204)
