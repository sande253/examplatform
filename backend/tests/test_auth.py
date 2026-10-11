import pytest

@pytest.mark.asyncio
async def test_register(async_client):
    res = await async_client.post("/api/v1/auth/register", json={
        "email": "test@test.com",
        "password": "password",
        "name": "Test User"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "test@test.com"

@pytest.mark.asyncio
async def test_login(async_client):
    res = await async_client.post("/api/v1/auth/login", data={
        "username": "test@test.com",
        "password": "password"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()

@pytest.mark.asyncio
async def test_refresh_token(async_client):
    login_res = await async_client.post("/api/v1/auth/login", data={
        "username": "test@test.com",
        "password": "password"
    })
    refresh_res = await async_client.post("/api/v1/auth/refresh", json={
        "refresh_token": login_res.json()["refresh_token"]
    })
    assert refresh_res.status_code == 200
    assert "access_token" in refresh_res.json()
