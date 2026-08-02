import sys
sys.path.insert(0, 'backend')

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from repositories.recipes import fetch_by_id_for_legacy
from models import Recipe as RecipeModel
from database import Base, get_db
from main import app
from fastapi.testclient import TestClient


@pytest.fixture()
def in_memory_session(SessionLocal):
    # Use SessionLocal fixture from conftest
    Session = SessionLocal
    session = Session()
    try:
        yield session
    finally:
        session.close()


# Tests for the FastAPI endpoint
@pytest.fixture()
def client_with_db(SessionLocal):
    # Use SessionLocal fixture; create tables are handled by engine fixture
    SessionLocal = SessionLocal
    # insert a sample recipe
    session = SessionLocal()
    r = RecipeModel(
        id='api1',
        title='API Detail',
        tags='test',
        ingredients='ing',
        instructions='do',
        info='info',
        image_path='/recipes/img/api1.png'
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
    app.dependency_overrides.clear()


def test_fetch_by_id_success(in_memory_session):
    session = in_memory_session
    r = RecipeModel(
        id='d1',
        title='Detail One',
        tags='test',
        ingredients='ing',
        instructions='do',
        info='info',
        image_path=None
    )
    session.add(r)
    session.commit()

    result = fetch_by_id_for_legacy(session, 'd1')
    assert result is not None
    assert result['title'] == 'Detail One'
    assert 'ingredients' in result and result['ingredients'] == 'ing'
    assert 'instructions' in result and result['instructions'] == 'do'
    assert 'info' in result and result['info'] == 'info'
    assert 'image_path' in result


def test_fetch_by_id_not_found(in_memory_session):
    session = in_memory_session
    result = fetch_by_id_for_legacy(session, 'missing')
    assert result is None


def test_fetch_by_id_db_error(monkeypatch):
    class BadSession:
        def query(self, *args, **kwargs):
            raise Exception('DB error')

    bad = BadSession()
    with pytest.raises(Exception):
        fetch_by_id_for_legacy(bad, 'd1')


# Tests for the FastAPI endpoint
@pytest.fixture()
def client_with_db():
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)

    # insert a sample recipe
    session = SessionLocal()
    r = RecipeModel(
        id='api1',
        title='API Detail',
        tags='test',
        ingredients='ing',
        instructions='do',
        info='info',
        image_path='/recipes/img/api1.png'
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
    app.dependency_overrides.clear()
    engine.dispose()


def test_get_recipe_success(client_with_db):
    resp = client_with_db.get('/api/recipes/api1')
    assert resp.status_code == 200
    data = resp.json()
    assert data['title'] == 'API Detail'
    assert 'ingredients' in data
    assert 'instructions' in data
    assert 'image_path' in data


def test_get_recipe_not_found(client_with_db):
    resp = client_with_db.get('/api/recipes/notexist')
    assert resp.status_code == 404


def test_get_recipe_server_error(monkeypatch, client_with_db):
    # monkeypatch repository to raise
    from repositories import recipes as repo

    def raise_exc(db, recipe_id):
        raise RuntimeError('boom')

    monkeypatch.setattr(repo, 'fetch_by_id_for_legacy', raise_exc)
    resp = client_with_db.get('/api/recipes/api1')
    assert resp.status_code == 500
