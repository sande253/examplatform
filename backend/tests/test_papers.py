import pytest

@pytest.mark.asyncio
async def test_get_papers_empty(async_client):
    res = await async_client.get("/api/v1/papers/")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
