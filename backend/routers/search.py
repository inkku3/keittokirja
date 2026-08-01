from fastapi import APIRouter, Depends, Query, Request, HTTPException, Response
from typing import List, Optional
import logging
from sqlalchemy.orm import Session
from database import get_db
from repositories.recipes import search_for_legacy
from schemas import LegacySearchItem

router = APIRouter(prefix="/api", tags=["search"])

logger = logging.getLogger('keittokirja.routers.search')

@router.get('/search', response_model=List[LegacySearchItem])
async def search_endpoint(
    request: Request,
    response: Response,
    q: Optional[str] = Query(None, description="Search query (substring match on title)"),
    tags: Optional[str] = Query(None, description="Comma-separated tags (AND semantics)"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum results to return"),
    offset: int = Query(0, ge=0, description="Result offset"),
    db: Session = Depends(get_db)
) -> List[LegacySearchItem]:
    """
    Legacy-compatible search endpoint.

    Behavior:
    - If q is empty/omitted and no tags: returns full alphabetically-sorted list (up to limit).
    - Matching: case-insensitive substring on title.
    - Tag filter: comma-separated tokens; recipe must include all tokens (AND semantics).

    Caching / headers:
    - For live per-keystroke search, responses are marked as private and not cached by shared CDNs by default.
    - Set Cache-Control: private, max-age=0, no-store to ensure clients always get fresh results while allowing browser control.
    """
    try:
        client = request.client.host if request.client else 'unknown'
        logger.info('Search request from %s q=%s tags=%s limit=%s offset=%s', client, q, tags, limit, offset)

        results = search_for_legacy(db, q=q, tags=tags, limit=limit, offset=offset)

        # Set conservative caching headers to support live search without stale responses
        # Browser will not cache; shared CDNs will treat as private. Adjust in deployment if using edge caching.
        response.headers['Cache-Control'] = 'private, max-age=0, no-store, no-cache, must-revalidate'
        response.headers['Pragma'] = 'no-cache'

        logger.info('Search returning %d items to %s', len(results), client)
        return results
    except Exception as e:
        logger.exception('Search endpoint failed: %s', e)
        raise HTTPException(status_code=500, detail='Search failed')
