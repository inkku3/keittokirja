from fastapi import APIRouter, Depends, Query, Request, HTTPException, Response
from typing import List, Optional
import logging
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from database import get_db
from models import Recipe as RecipeModel, RecipeTag
from schemas import LegacySearchItem
from config import settings

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
    Legacy‑compatible search endpoint.
    - If q is empty/omitted and no tags: returns full alphabetically‑sorted list (up to limit).
    - Matching: case‑insensitive substring on title.
    - Tag filter: comma‑separated tokens; recipe must include all tokens (AND semantics).
    """
    try:
        client = request.client.host if request.client else 'unknown'
        logger.info('Search request from %s q=%s tags=%s', client, q, tags)
        query = db.query(RecipeModel).options(joinedload(RecipeModel.tags))
        if q and q.strip():
            query = query.filter(func.lower(RecipeModel.title).contains(q.lower()))
        if tags:
            tag_list = list({t.strip() for t in tags.split(",") if t.strip()})
            if tag_list:
                subq = db.query(RecipeTag.recipe_id) \
                         .filter(RecipeTag.tag.in_(tag_list)) \
                         .group_by(RecipeTag.recipe_id) \
                         .having(func.count(func.distinct(RecipeTag.tag)) == len(tag_list))
                query = query.filter(RecipeModel.id.in_(subq))
        recipes = query.order_by(RecipeModel.title).offset(offset).limit(limit).all()
        images_base = settings.images_base_url.rstrip('/') if settings.images_base_url else None
        results = []
        for recipe in recipes:
            tags_list = [tag.tag for tag in recipe.tags]
            tags_str = ",".join(tags_list) if tags_list else None
            image_path = f"{images_base}/{recipe.id}.png" if images_base else None
            results.append(LegacySearchItem(
                name=recipe.title,
                url=f"recipes/{recipe.id}",
                tags=tags_str,
                image_path=image_path
            ))
        response.headers['Cache-Control'] = 'private, max-age=0, no-store, no-cache, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        logger.info('Search returning %d items', len(results))
        return results
    except Exception as e:
        logger.exception('Search failed: %s', e)
        raise HTTPException(status_code=500, detail='Search failed')
