import sys
sys.path.insert(0, 'backend')

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, get_db
from models import Recipe as RecipeModel
from main import app
from fastapi.testclient import TestClient

from repositories import recipes as repo


@pytest.fixture()
def client_with_db():
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)

    # seed data
    session = SessionLocal()
    items = [
        RecipeModel(id='s1', title='Lohikeitto', tags='keitto,kala', ingredients='i1', instructions='s1', info='info1', image_path='/recipes/img/s1.png'),
        RecipeModel(id='s2', title='Salaatti', tags='kasvis', ingredients='i2', instructions='s2', info='info2', image_path=None),
        RecipeModel(id='s3', title='LohiPaistos', tags='paisti', ingredients='i3', instructions='s3', info='info3', image_path=None),
    ]
    for r in items:
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

    app.dependency_overrides.clear()
    engine.dispose()


def test_search_success(client_with_db):
    client = client_with_db
    resp = client.get('/api/search?q=lohi')
    assert resp.status_code == 200
    data = resp.json()
    # should include items with 'lohi' in title (case-insensitive)
    names = [d['name'] for d in data]
    assert any('Lohikeitto' == n or 'LohiPaistos' == n for n in names)


def test_search_empty_returns_all_sorted(client_with_db):
    client = client_with_db
    resp = client.get('/api/search')
    assert resp.status_code == 200
    data = resp.json()
    # Expect at least the seeded names
    names = [d['name'] for d in data]
    assert set(['Lohikeitto', 'Salaatti', 'LohiPaistos']).issubset(set(names))
    # Ensure sorted by lower(name)
    sorted_names = sorted(names, key=lambda s: s.lower())
    assert names == sorted_names


def test_search_invalid_params(client_with_db):
    client = client_with_db
    # invalid negative offset -> FastAPI should return 422 Unprocessable Entity
    resp = client.get('/api/search?offset=-1')
    assert resp.status_code == 422


def test_search_server_error(monkeypatch, client_with_db):
    client = client_with_db

    def raise_exc(db, q=None, tags=None, limit=100, offset=0):
        raise RuntimeError('boom')

    monkeypatch.setattr(repo, 'search_for_legacy', raise_exc)
    resp = client.get('/api/search?q=lohi')
    assert resp.status_code == 500
