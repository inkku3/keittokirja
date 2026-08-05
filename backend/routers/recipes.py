from fastapi import APIRouter, Depends, Query, HTTPException, Path, Request
import logging
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, func, or_
from database import get_db
from models import Recipe as RecipeModel, RecipeTag
from schemas import Recipe, LegacyListItem, LegacyRecipeDetail
from typing import List, Optional
import random

router = APIRouter(prefix="/api/recipes", tags=["recipes"])
logger = logging.getLogger('keittokirja.routers.recipes')

def _recipe_to_legacy_list_item(recipe: RecipeModel) -> LegacyListItem:
    """Convert Recipe ORM to LegacyListItem (name, url, image_path=None)."""
    return LegacyListItem(
        name=recipe.title,
        url=f"recipes/{recipe.id}",
        image_path=None  # not stored in DB
    )

def _recipe_to_legacy_detail(recipe: RecipeModel) -> LegacyRecipeDetail:
    """Convert Recipe ORM to LegacyRecipeDetail."""
    return LegacyRecipeDetail(
        title=recipe.title,
        ingredients=recipe.ingredients or "",
        instructions=recipe.instructions or "",
        info=recipe.info,
        image_path=None
    )

def _recipe_to_schema(recipe: RecipeModel) -> Recipe:
    """Convert ORM model to response schema, aggregating tags as comma‑separated string."""
    tags_list = [tag.tag for tag in recipe.tags]
    tags_str = ",".join(tags_list) if tags_list else None
    return Recipe(
        id=recipe.id,
        title=recipe.title,
        ingredients=recipe.ingredients or "",
        instructions=recipe.instructions or "",
        info=recipe.info,
        tags=tags_str,
        image_path=None,
        created_at=None,
        updated_at=None,
    )

@router.get("/", response_model=List[Recipe])
async def list_recipes(
    request: Request,
    sort_by: str = Query("title", regex="^(title|id)$"),
    order: str = Query("asc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db)
) -> List[Recipe]:
    """
    List all recipes in the standard Recipe shape (id, title, ingredients, instructions, etc.).
    """
    try:
        client_addr = request.client.host if request.client else 'unknown'
        logger.info("Recipe list request from %s", client_addr)

        query = db.query(RecipeModel)
        if sort_by == "title":
            order_col = RecipeModel.title
        else:
            order_col = RecipeModel.id
        if order == "desc":
            query = query.order_by(desc(order_col))
        else:
            query = query.order_by(asc(order_col))

        recipes = query.all()
        items = [_recipe_to_schema(r) for r in recipes]
        logger.info("Returning %d items", len(items))
        return items
    except Exception as e:
        logger.exception("Failed to fetch recipes: %s", e)
        raise HTTPException(status_code=500, detail="Failed to retrieve recipes")

@router.get("/search", response_model=List[Recipe])
async def search_recipes(
    q: str = Query(..., description="Search query to match against recipe title"),
    db: Session = Depends(get_db)
) -> List[Recipe]:
    """
    Search recipes by title (case‑insensitive substring).
    """
    recipes = db.query(RecipeModel).filter(
        func.lower(RecipeModel.title).contains(q.lower())
    ).order_by(RecipeModel.title).all()
    return [_recipe_to_schema(r) for r in recipes]

@router.get("/filter", response_model=List[Recipe])
async def filter_recipes_by_tags(
    tags: str = Query(..., description="Comma-separated tags (AND semantics)"),
    db: Session = Depends(get_db)
) -> List[Recipe]:
    """
    Filter recipes that have ALL given tags.
    """
    tag_list = [t.strip() for t in tags.split(",") if t.strip()]
    if not tag_list:
        return []

    # Find recipe_ids that have all tags
    subq = db.query(RecipeTag.recipe_id) \
              .filter(RecipeTag.tag.in_(tag_list)) \
              .group_by(RecipeTag.recipe_id) \
              .having(func.count(RecipeTag.tag) == len(tag_list))
    recipe_ids = [row[0] for row in subq.all()]
    if not recipe_ids:
        return []

    recipes = db.query(RecipeModel).filter(RecipeModel.id.in_(recipe_ids)) \
                .order_by(RecipeModel.title).all()
    return [_recipe_to_schema(r) for r in recipes]

@router.get("/random", response_model=Recipe)
async def get_random_recipe(db: Session = Depends(get_db)) -> Recipe:
    """Get a random recipe."""
    recipe = db.query(RecipeModel).order_by(func.random()).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="No recipes available")
    return _recipe_to_schema(recipe)

@router.get("/{recipe_id}", response_model=Recipe)
async def get_recipe(
    request: Request,
    recipe_id: str = Path(..., description="Recipe ID"),
    db: Session = Depends(get_db)
) -> Recipe:
    """Get a specific recipe in standard Recipe shape."""
    try:
        client_addr = request.client.host if request.client else 'unknown'
        logger.info("Recipe detail request for id=%s from %s", recipe_id, client_addr)

        recipe = db.query(RecipeModel).filter(RecipeModel.id == recipe_id).first()
        if not recipe:
            raise HTTPException(status_code=404, detail=f"Recipe '{recipe_id}' not found")

        return _recipe_to_schema(recipe)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to fetch recipe %s: %s", recipe_id, e)
        raise HTTPException(status_code=500, detail="Failed to retrieve recipe")
