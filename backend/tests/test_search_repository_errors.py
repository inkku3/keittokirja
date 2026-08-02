import sys
sys.path.insert(0, 'backend')

import pytest
from repositories.recipes import search_for_legacy


def test_search_db_error_raises():
    class BadSession:
        # emulate parts of SQLAlchemy Session used by repository
        @property
        def bind(self):
            return None

        def query(self, *args, **kwargs):
            raise Exception('simulated DB error')

    bad = BadSession()
    with pytest.raises(Exception):
        search_for_legacy(bad, q='lohi')
