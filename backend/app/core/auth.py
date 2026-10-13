"""Validate Supabase access tokens against the project's Auth server."""
import asyncio
import json
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from uuid import UUID

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

bearer = HTTPBearer(auto_error=False)


def _verify_token(token: str) -> UUID:
    url = os.getenv("SUPABASE_URL", "").rstrip("/")
    key = os.getenv("SUPABASE_ANON_KEY", "")
    if not url.startswith("https://") or not key:
        raise HTTPException(503, "Supabase authentication is not configured")
    request = Request(f"{url}/auth/v1/user", headers={
        "Authorization": f"Bearer {token}", "apikey": key,
    })
    try:
        with urlopen(request, timeout=10) as response:
            return UUID(json.load(response)["id"])
    except HTTPError as exc:
        if exc.code in (401, 403):
            raise HTTPException(401, "Invalid or expired access token",
                                headers={"WWW-Authenticate": "Bearer"}) from None
        raise HTTPException(503, "Authentication service unavailable") from None
    except (URLError, TimeoutError, OSError, ValueError, KeyError, TypeError):
        raise HTTPException(503, "Authentication service unavailable") from None


async def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> UUID:
    if credentials is None:
        raise HTTPException(401, "Authentication required", headers={"WWW-Authenticate": "Bearer"})
    return await asyncio.to_thread(_verify_token, credentials.credentials)
