import io
from unittest.mock import Mock
from urllib.error import HTTPError, URLError
from uuid import uuid4

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.core.auth import current_user
from app.routes import account


def client_for(user=None):
    app = FastAPI()
    app.include_router(account.account_router, prefix='/account')
    if user:
        app.dependency_overrides[current_user] = lambda: user
    return TestClient(app)


def test_delete_requires_auth():
    assert client_for().delete('/account').status_code == 401


def test_only_token_owner_is_deleted(monkeypatch):
    owner = uuid4()
    delete = Mock()
    monkeypatch.setattr(account, 'delete_auth_user', delete)
    response = client_for(owner).request('DELETE', '/account', json={'userId': str(uuid4())})
    assert response.status_code == 204
    assert response.content == b''
    delete.assert_called_once_with(owner)


def test_missing_admin_key_fails_closed(monkeypatch):
    monkeypatch.delenv('SUPABASE_SECRET_KEY', raising=False)
    monkeypatch.setenv('SUPABASE_SERVICE_ROLE_KEY', 'unused-legacy-key')
    assert client_for(uuid4()).delete('/account').status_code == 503


def test_admin_request_hard_deletes_and_uses_server_key(monkeypatch):
    monkeypatch.setenv('SUPABASE_URL', 'https://example.supabase.co')
    monkeypatch.setenv('SUPABASE_SECRET_KEY', 'sb_secret_test-only')
    owner = uuid4()
    def send(request, timeout):
        assert request.full_url.endswith(f'/admin/users/{owner}')
        assert request.method == 'DELETE'
        assert request.get_header('Apikey') == 'sb_secret_test-only'
        assert request.get_header('Authorization') is None
        assert request.data == b'{"should_soft_delete":false}'
        assert timeout == 15
        return io.BytesIO(b'{}')
    monkeypatch.setattr(account, 'urlopen', send)
    account.delete_auth_user(owner)


@pytest.mark.parametrize('failure', [HTTPError('url', 500, 'private details', {}, None), URLError('private details')])
def test_service_failure_is_not_success_or_secret_leak(monkeypatch, failure):
    monkeypatch.setenv('SUPABASE_URL', 'https://example.supabase.co')
    monkeypatch.setenv('SUPABASE_SECRET_KEY', 'sb_secret_test-only')
    monkeypatch.setattr(account, 'urlopen', Mock(side_effect=failure))
    response = client_for(uuid4()).delete('/account')
    assert response.status_code == 503
    assert 'private details' not in response.text
    assert 'sb_secret_test-only' not in response.text


def test_concurrent_deletion_is_idempotent(monkeypatch):
    monkeypatch.setenv('SUPABASE_URL', 'https://example.supabase.co')
    monkeypatch.setenv('SUPABASE_SECRET_KEY', 'sb_secret_test-only')
    monkeypatch.setattr(account, 'urlopen', Mock(side_effect=HTTPError('url', 404, '', {}, None)))
    assert client_for(uuid4()).delete('/account').status_code == 204
