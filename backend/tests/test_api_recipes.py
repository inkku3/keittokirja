import sys
sys.path.insert(0, 'backend')

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, get_db
from main import app
from models import Recipe as RecipeModel


@pytest.fixture()
def test_client():
    # Setup in-memory SQLite and override get_db dependency
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)

    # Insert sample data
    session = SessionLocal()
    r = RecipeModel(
        id='r10',
        title='API Test',
        tags='main',
        ingredients='ing',
        instructions='do',
        info='info',
        image_path='/recipes/img/r10.png'
    )
    session.add(r)
    session.commit()
    session.close()

    def override_get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)

    yield client

    # Teardown
    app.dependency_overrides.clear()
    engine.dispose()


def test_api_recipes_list_returns_legacy_shape(test_client):
    client = test_client
    resp = client.get('/api/recipes/')
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert any(item.get('name') == 'API Test' for item in data)
    # check image_path present in at least one item
    assert any('image_path' in item for item in data)
