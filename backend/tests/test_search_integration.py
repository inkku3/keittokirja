import threading
import http.server
import socketserver
import time
import os
import sys

# Ensure backend package is importable when running tests from repo root
sys.path.insert(0, os.path.abspath('backend'))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, get_db
from main import app
from models import Recipe as RecipeModel

try:
    import requests
    from bs4 import BeautifulSoup
except Exception:
    requests = None
    BeautifulSoup = None


@pytest.fixture(scope='module')
def backend_test_client():
    """Create TestClient with an in-memory SQLite DB containing sample recipes."""
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)

    # Insert sample recipes
    session = SessionLocal()
    items = [
        RecipeModel(id='smoke1', title='Lohikeitto', tags='keitto,kala', ingredients='i1', instructions='s1', info='info1', image_path='/recipes/img/smoke1.png'),
        RecipeModel(id='smoke2', title='Salaatti', tags='kasvis', ingredients='i2', instructions='s2', info='info2', image_path=None),
        RecipeModel(id='smoke3', title='LohiPaistos', tags='paisti', ingredients='i3', instructions='s3', info='info3', image_path=None),
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


class SilentHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


@pytest.fixture(scope='module')
def static_frontend_server(tmp_path_factory):
    """Serve frontend/dist if present, otherwise serve legacy/index.html as a fallback.

    Returns the (host, port) tuple for the server.
    """
    # Choose directory to serve
    repo_root = os.path.abspath('.')
    dist_dir = os.path.join(repo_root, 'frontend', 'dist')
    if os.path.isdir(dist_dir):
        serve_dir = dist_dir
    else:
        # Fallback: create a temp folder with legacy index.html
        serve_dir = tmp_path_factory.mktemp('static').as_posix()
        legacy_index = os.path.join(repo_root, 'legacy', 'index.html')
        if os.path.isfile(legacy_index):
            with open(legacy_index, 'r', encoding='utf-8') as f_in:
                content = f_in.read()
            with open(os.path.join(serve_dir, 'index.html'), 'w', encoding='utf-8') as f_out:
                f_out.write(content)
        else:
            # Minimal fallback HTML
            with open(os.path.join(serve_dir, 'index.html'), 'w', encoding='utf-8') as f_out:
                f_out.write('<!doctype html><html><body><div id="recipes"></div><input id="search"/></body></html>')

    # Start server
    port = 8001
    handler = SilentHTTPRequestHandler
    old_cwd = os.getcwd()
    os.chdir(serve_dir)
    httpd = socketserver.TCPServer(('127.0.0.1', port), handler)

    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()

    # wait briefly for server to start
    time.sleep(0.2)

    yield ('127.0.0.1', port)

    httpd.shutdown()
    httpd.server_close()
    thread.join(timeout=1)
    os.chdir(old_cwd)


@pytest.mark.skipif(requests is None or BeautifulSoup is None, reason="requests and bs4 required for integration test")
def test_integration_search_live(backend_test_client, static_frontend_server):
    host, port = static_frontend_server
    base = f'http://{host}:{port}'

    # Fetch frontend index.html
    resp = requests.get(base + '/', timeout=5)
    assert resp.status_code == 200

    # Parse HTML and assert legacy selectors exist
    soup = BeautifulSoup(resp.text, 'html.parser')
    assert soup.find(id='recipes') is not None, 'Missing #recipes container in index.html'
    assert soup.find(id='search') is not None, 'Missing #search input in index.html'

    # Now test backend search API mimicking live typing
    api_client = backend_test_client

    # initial full list (no q)
    r0 = api_client.get('/api/search')
    assert r0.status_code == 200
    data0 = r0.json()
    assert isinstance(data0, list)
    assert any(item.get('name') == 'Lohikeitto' for item in data0)

    # simulate typing 'lohi' and assert results contain both Lohi items
    r1 = api_client.get('/api/search', params={'q': 'lohi'})
    assert r1.status_code == 200
    data1 = r1.json()
    names = [it['name'] for it in data1]
    assert 'Lohikeitto' in names
    assert 'LohiPaistos' in names

    # simulate tag filter AND semantics
    r2 = api_client.get('/api/search', params={'tags': 'keitto,kala'})
    assert r2.status_code == 200
    data2 = r2.json()
    # only Lohikeitto has both tags
    assert [it['name'] for it in data2] == ['Lohikeitto']
