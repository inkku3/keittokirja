from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from models import Recipe as RecipeModel
from schemas import LegacyListItem, LegacyRecipeDetail, LegacySearchItem


def fetch_all_for_legacy(db: Session) -> List[Dict[str, str]]:
    """
    Return a list of plain dicts in the legacy shape used by script.js:
      [{ "name": <title>, "url": "recipes/<id>" }, ...]

    No framing or extra metadata — suitable to return directly from an API endpoint
    that must preserve legacy behavior.
    """
    rows = db.query(RecipeModel.id, RecipeModel.title).all()
    result: List[Dict[str, str]] = []
    for r in rows:
        rec_id, title = r
        # Determine image path: prefer stored image_path, otherwise fallback to legacy static path
        db_rec = None
        try:
            # attempt to load the full record to read image_path (lightweight) -- optional
            db_rec = db.query(RecipeModel).filter(RecipeModel.id == rec_id).first()
        except Exception:
            db_rec = None

        if db_rec and getattr(db_rec, 'image_path', None):
            img = db_rec.image_path
        else:
            # use legacy static path without extension; frontend/detail/resolver will try extensions
            img = f"/recipes/img/{rec_id}"

        # validate/construct via Pydantic to ensure shape
        item = LegacyListItem(name=title, url=f"recipes/{rec_id}", image_path=img)
        result.append(item.dict())
    return result


def fetch_by_id_for_legacy(db: Session, recipe_id: str) -> Optional[Dict[str, str]]:
    """
    Return a plain dict that mirrors the legacy Firestore document shape used by recipelookup.js.
    Example keys: title, ingredients, instructions, info
    """
    rec = db.query(RecipeModel).filter(RecipeModel.id == recipe_id).first()
    if not rec:
        return None

    # Determine image_path: prefer stored image_path; otherwise return legacy relative path (no extension)
    image_path = rec.image_path if getattr(rec, 'image_path', None) else f"/recipes/img/{recipe_id}"

    detail = LegacyRecipeDetail(
        title=rec.title,
        ingredients=rec.ingredients or "",
        instructions=rec.instructions or "",
        info=rec.info or "",
        image_path=image_path,
    )
    return detail.dict()


from sqlalchemy import func, text


def search_for_legacy(db: Session, q: Optional[str] = None, tags: Optional[str] = None, limit: int = 100, offset: int = 0) -> List[Dict[str, str]]:
    """
    Search repository implementing legacy semantics:
    - Case-insensitive substring match on title (lower(title) LIKE %q%).
    - Tag AND-semantics when tags is a comma-separated string.
    - Always order by lower(title) ASC.

    Optimizations:
    - When connected to PostgreSQL, uses string_to_array(...) @> ... expression for tag filtering so the GIN index on (string_to_array(tags, ',')) can be used.
    - For portability (SQLite tests), falls back to client-side tag filtering when the DB doesn't support string_to_array.
    """
    # Normalize query
    q_norm = q.strip() if isinstance(q, str) and q.strip() else None

    # Base query
    qry = db.query(RecipeModel)

    if q_norm:
        # case-insensitive substring match
        qry = qry.filter(func.lower(RecipeModel.title).like(f"%{q_norm.lower()}%"))

    # Order by lower(title)
    qry = qry.order_by(func.lower(RecipeModel.title).asc())

    # Apply offset/limit for DB query; tag filtering may further reduce results in fallback path
    qry = qry.offset(offset).limit(limit)

    # If tags provided and DB is PostgreSQL, use string_to_array expression for server-side filtering
    results = []
    dialect_name = getattr(db.bind, 'dialect', None)
    dialect = dialect_name.name if dialect_name is not None else None

    if tags and dialect == 'postgresql':
        # Use SQL text expression to leverage GIN index on string_to_array(tags, ',')
        expr = text("string_to_array(tags, ',') @> string_to_array(:tags, ',')")
        # Rebuild base query to include tag filter
        qry_tags = db.query(RecipeModel).filter(expr).order_by(func.lower(RecipeModel.title).asc()).offset(offset).limit(limit).params(tags=tags)
        rows = qry_tags.all()
        for rec in rows:
            image_path = rec.image_path if getattr(rec, 'image_path', None) else f"/recipes/img/{rec.id}"
            item = LegacySearchItem(name=rec.title, url=f"recipes/{rec.id}", tags=rec.tags or "", image_path=image_path)
            results.append(item.dict())
        return results

    # Else: run DB query and apply tag filtering in Python if needed
    rows = qry.all()

    if tags:
        # Legacy behavior: tags are CSV and matching is exact token match; whitespace is significant in legacy code
        tag_tokens = tags.split(',')
        filtered = []
        for rec in rows:
            rec_tags = rec.tags or ''
            tag_array = rec_tags.split(',') if rec_tags else []
            has_all = True
            for t in tag_tokens:
                if t not in tag_array:
                    has_all = False
                    break
            if has_all:
                filtered.append(rec)
        rows = filtered

    for rec in rows:
        image_path = rec.image_path if getattr(rec, 'image_path', None) else f"/recipes/img/{rec.id}"
        item = LegacySearchItem(name=rec.title, url=f"recipes/{rec.id}", tags=rec.tags or "", image_path=image_path)
        results.append(item.dict())

    return results
