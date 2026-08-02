import pytest
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

from database import Base


@pytest.fixture(scope='function')
def engine():
    # Use StaticPool with check_same_thread=False so SQLite :memory: DB is shared across threads
    engine = create_engine(
        'sqlite:///:memory:',
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    # Create schema for each test
    Base.metadata.create_all(bind=engine)
    yield engine
    engine.dispose()


@pytest.fixture(scope='function')
def SessionLocal(engine):
    return sessionmaker(bind=engine)
