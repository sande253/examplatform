import pytest

@pytest.mark.asyncio
async def test_get_questions_empty(async_client):
    res = await async_client.get("/api/v1/questions/")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
