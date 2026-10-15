from datetime import datetime, timezone
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.auth import current_user
from app.routes import scraps


@pytest.fixture
def client():
    app = FastAPI()
    app.include_router(scraps.scraps_router, prefix="/scraps")
    return TestClient(app)


def snapshot():
    return dict(id=uuid4(), user_id=uuid4(), summary_id=uuid4(), persona_id="GOO_WORLD_1",
                title="title", content="snapshot", news_url="https://example.com/news",
                source="source", category="world", saved_at=datetime.now(timezone.utc))


def test_requires_auth(client):
    assert client.post('/scraps/status', json={"summaryIds": [str(uuid4())]}).status_code == 401
    assert client.get('/scraps').status_code == 401
    assert client.post('/scraps', json={"summaryId": str(uuid4())}).status_code == 401
    assert client.post('/scraps/batch-delete', json={"ids": [str(uuid4())]}).status_code == 401


def test_save_uses_authenticated_user_and_hides_owner(client, monkeypatch):
    user = uuid4()
    row = snapshot()
    client.app.dependency_overrides[current_user] = lambda: user
    save = AsyncMock(return_value=row)
    monkeypatch.setattr(scraps, 'save_scrap', save)
    response = client.post('/scraps', json={"summaryId": str(row['summary_id'])})
    assert response.status_code == 200
    assert response.json()['savedAt']
    assert 'user_id' not in response.json()
    save.assert_awaited_once_with(user, row['summary_id'])
    assert client.post('/scraps', json={"summaryId": str(uuid4()), "userId": str(uuid4())}).status_code == 422


def test_expired_summary(client, monkeypatch):
    client.app.dependency_overrides[current_user] = uuid4
    monkeypatch.setattr(scraps, 'save_scrap', AsyncMock(return_value=None))
    assert client.post('/scraps', json={"summaryId": str(uuid4())}).status_code == 404


def test_pagination(client, monkeypatch):
    user = uuid4()
    client.app.dependency_overrides[current_user] = lambda: user
    rows = [snapshot(), snapshot()]
    fetch = AsyncMock(return_value=rows)
    monkeypatch.setattr(scraps, 'list_scraps', fetch)
    response = client.get('/scraps?limit=1').json()
    assert len(response['items']) == 1
    before = scraps.decode_cursor(response['nextCursor'])
    assert before == (rows[0]['saved_at'], rows[0]['id'])
    client.get('/scraps', params={"cursor": response['nextCursor'], "limit": 1})
    fetch.assert_awaited_with(user, 1, before)
    assert client.get('/scraps?cursor=invalid').status_code == 422
    assert client.get('/scraps?limit=101').status_code == 422


def test_delete_is_scoped_and_bounded(client, monkeypatch):
    user, identifier = uuid4(), uuid4()
    client.app.dependency_overrides[current_user] = lambda: user
    delete = AsyncMock(return_value=[identifier])
    monkeypatch.setattr(scraps, 'delete_scraps', delete)
    response = client.post('/scraps/batch-delete', json={"ids": [str(identifier), str(identifier)]})
    assert response.json()['deletedCount'] == 1
    delete.assert_awaited_once_with(user, [identifier])
    assert client.post('/scraps/batch-delete', json={"ids": []}).status_code == 422


def test_auth_service_verifies_token(monkeypatch):
    import io
    from app.core import auth
    from urllib.error import HTTPError
    monkeypatch.setenv('SUPABASE_URL', 'https://example.supabase.co')
    monkeypatch.setenv('SUPABASE_ANON_KEY', 'public-key')
    identifier = uuid4()
    def success(request, timeout):
        assert request.full_url == 'https://example.supabase.co/auth/v1/user'
        assert request.get_header('Authorization') == 'Bearer token'
        return io.BytesIO(('{"id":"' + str(identifier) + '"}').encode())
    monkeypatch.setattr(auth, 'urlopen', success)
    assert auth._verify_token('token') == identifier
    def failure(*args, **kwargs):
        raise HTTPError('url', 401, 'Unauthorized', {}, None)
    monkeypatch.setattr(auth, 'urlopen', failure)
    with pytest.raises(auth.HTTPException) as error:
        auth._verify_token('invalid')
    assert error.value.status_code == 401


def test_status_is_scoped_and_validated(client, monkeypatch):
    user, summary, saved = uuid4(), uuid4(), uuid4()
    client.app.dependency_overrides[current_user] = lambda: user
    lookup = AsyncMock(return_value=[{"summaryId": summary, "scrapId": saved}])
    monkeypatch.setattr(scraps, 'scrap_status', lookup)
    response = client.post('/scraps/status', json={"summaryIds": [str(summary), str(summary)]})
    assert response.json() == {"items": [{"summaryId": str(summary), "scrapId": str(saved)}]}
    lookup.assert_awaited_once_with(user, [summary])
    assert client.post('/scraps/status', json={"summaryIds": []}).status_code == 422
    assert client.post('/scraps/status', json={"summaryIds": [str(summary)] * 101}).status_code == 422
    assert client.post('/scraps/status', json={"summaryIds": ["invalid"]}).status_code == 422
    assert client.post('/scraps/status', json={"summaryIds": [str(summary)], "userId": str(user)}).status_code == 422
