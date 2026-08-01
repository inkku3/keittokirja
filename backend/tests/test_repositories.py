import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend to path when running tests from repo root
import sys
sys.path.insert(0, 'backend')

from database import Base
from models import Recipe as RecipeModel
from repositories.recipes import fetch_all_for_legacy, fetch_by_id_for_legacy


@pytest.fixture()
def in_memory_db():
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


def test_fetch_all_for_legacy_returns_name_and_url_and_image(in_memory_db):
    session = in_memory_db
    # insert a sample recipe
    r = RecipeModel(
        id='r1',
        title='Test Recipe',
        tags='main, chicken',
        ingredients='1 egg',
        instructions='Cook it',
        info='Serves 1',
        image_path='/recipes/img/r1.png'
    )
    session.add(r)
    session.commit()

    items = fetch_all_for_legacy(session)
    assert isinstance(items, list)
    assert len(items) == 1
    assert items[0]['name'] == 'Test Recipe'
    assert items[0]['url'] == 'recipes/r1'
    assert items[0]['image_path'] == '/recipes/img/r1.png'


def test_fetch_by_id_for_legacy_returns_detail(in_memory_db):
    session = in_memory_db
    r = RecipeModel(
        id='r2',
        title='Another',
        tags='dessert',
        ingredients='sugar',
        instructions='stir',
        info='Test info',
        image_path=None
    )
    session.add(r)
    session.commit()

    detail = fetch_by_id_for_legacy(session, 'r2')
    assert detail is not None
    assert detail['title'] == 'Another'
    assert 'ingredients' in detail and detail['ingredients'] == 'sugar'
    assert 'instructions' in detail and detail['instructions'] == 'stir'
    assert 'info' in detail and detail['info'] == 'Test info'
    assert 'image_path' in detail
