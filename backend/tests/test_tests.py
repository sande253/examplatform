import pytest

@pytest.mark.asyncio
async def test_start_test_unauthorized(async_client):
    res = await async_client.post("/api/v1/tests/", json={"paper_id": "dummy"})
    assert res.status_code == 401
