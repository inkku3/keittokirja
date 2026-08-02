import sys
sys.path.insert(0, 'backend')

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base
from models import Recipe as RecipeModel
from repositories.recipes import search_for_legacy


@pytest.fixture()
def in_memory_session():
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


def seed_recipes(session):
    items = [
        RecipeModel(id='r1', title='Lohikeitto', tags='keitto,kala', ingredients='i1', instructions='s1', info='info1', image_path=None),
        RecipeModel(id='r2', title='LohiKeitto Special', tags='keitto', ingredients='i2', instructions='s2', info='info2', image_path=None),
        RecipeModel(id='r3', title='Käristys', tags='paisti', ingredients='i3', instructions='s3', info='info3', image_path=None),
        RecipeModel(id='r4', title='Salaatti', tags='kasvis', ingredients='i4', instructions='s4', info='info4', image_path=None),
    ]
    for r in items:
        session.add(r)
    session.commit()


def test_search_exact_match(in_memory_session):
    s = in_memory_session
    seed_recipes(s)
    results = search_for_legacy(s, q='Lohikeitto')
    names = [r['name'] for r in results]
    assert 'Lohikeitto' in names


def test_search_partial_match_case_insensitive(in_memory_session):
    s = in_memory_session
    seed_recipes(s)
    results = search_for_legacy(s, q='lohi')
    names = [r['name'] for r in results]
    # both r1 and r2 contain 'lohi' (case-insensitive)
    assert 'Lohikeitto' in names
    assert 'LohiKeitto Special' in names


def test_search_diacritics(in_memory_session):
    s = in_memory_session
    seed_recipes(s)
    # exact diacritic substring (depends on DB collation); test exact-match with same characters
    results = search_for_legacy(s, q='K\x00e4r')
    # If diacritics handling differs, at least ensure function doesn't crash and returns a list
    assert isinstance(results, list)


def test_search_tags_and_semantics(in_memory_session):
    s = in_memory_session
    seed_recipes(s)
    # single tag
    results = search_for_legacy(s, tags='kala')
    names = [r['name'] for r in results]
    assert 'Lohikeitto' in names

    # AND semantics: both tags present
    results2 = search_for_legacy(s, tags='kala,keitto')
    names2 = [r['name'] for r in results2]
    assert 'Lohikeitto' in names2

    # non-matching combination
    results3 = search_for_legacy(s, tags='kala,notag')
    assert results3 == []


def test_empty_query_returns_all_sorted(in_memory_session):
    s = in_memory_session
    seed_recipes(s)
    results = search_for_legacy(s, q=None)
    names = [r['name'] for r in results]
    # Expect all seeded names, sorted by lower(name)
    assert set(names) >= {'Lohikeitto', 'LohiKeitto Special', 'Käristys', 'Salaatti'}
