from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from models import Recipe as RecipeModel
from schemas import LegacyListItem, LegacyRecipeDetail


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

    detail = LegacyRecipeDetail(
        title=rec.title,
        ingredients=rec.ingredients or "",
        instructions=rec.instructions or "",
        info=rec.info or "",
        image_path=rec.image_path or "",
    )
    return detail.dict()
