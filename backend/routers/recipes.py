from fastapi import APIRouter, Depends, Query, HTTPException, Path, Request
import logging
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, func
from database import get_db
from models import Recipe as RecipeModel
from schemas import Recipe, LegacyListItem, LegacyRecipeDetail
from typing import List
import random
from repositories.recipes import fetch_all_for_legacy, fetch_by_id_for_legacy

router = APIRouter(prefix="/api/recipes", tags=["recipes"])

logger = logging.getLogger('keittokirja.routers.recipes')

@router.get("/", response_model=List[LegacyListItem])
async def list_recipes(
    request: Request,
    sort_by: str = Query("title", description="Field to sort by (title)"),
    order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db)
) -> List[LegacyListItem]:
    """
    List all recipes in the legacy {name, url, image_path} shape.

    Returns 200 with an empty list if no recipes are found.
    Returns 500 if an unexpected server error occurs.
    """
    try:
        client_addr = request.client.host if request.client else 'unknown'
        logger.info("Received legacy recipe list request from %s (sort_by=%s, order=%s)", client_addr, sort_by, order)

        items = fetch_all_for_legacy(db)
        if items is None:
            items = []

        logger.info("Legacy recipe list: returning %d items to %s", len(items), client_addr)
        return items
    except Exception as e:
        logger.exception("Failed to fetch recipes for legacy list: %s", str(e))
        # Return a 500 to signal server error while keeping the response shape consistent on success
        raise HTTPException(status_code=500, detail="Failed to retrieve recipes")

@router.get("/search", response_model=List[Recipe])
async def search_recipes(
    q: str = Query(..., description="Search query to match against recipe title"),
    db: Session = Depends(get_db)
) -> List[Recipe]:
    """
    Search recipes by title.
    
    Query parameters:
    - q: Search query string (required)
    
    Returns recipes whose titles contain the search query (case-insensitive).
    """
    # Case-insensitive search using ILIKE
    recipes = db.query(RecipeModel).filter(
        func.lower(RecipeModel.title).contains(q.lower())
    ).order_by(RecipeModel.title).all()
    
    return recipes

@router.get("/filter", response_model=List[Recipe])
async def filter_recipes_by_tags(
    tags: str = Query(..., description="Comma-separated tags to filter by"),
    db: Session = Depends(get_db)
) -> List[Recipe]:
    """
    Filter recipes by tags.
    
    Query parameters:
    - tags: Comma-separated list of tags to filter by (required)
    
    Returns recipes that contain ALL specified tags (case-insensitive).
    Tags are compared as comma-separated values stored in the recipe's tags field.
    """
    # Parse the tags from query parameter
    requested_tags = [tag.strip().lower() for tag in tags.split(',') if tag.strip()]
    
    if not requested_tags:
        return []
    
    # Get all recipes
    all_recipes = db.query(RecipeModel).all()
    
    # Filter recipes that have all requested tags
    matching_recipes = []
    for recipe in all_recipes:
        if not recipe.tags:
            continue
        
        # Parse recipe tags and convert to lowercase for comparison
        recipe_tags = [tag.strip().lower() for tag in recipe.tags.split(',')]
        
        # Check if recipe has all requested tags
        if all(req_tag in recipe_tags for req_tag in requested_tags):
            matching_recipes.append(recipe)
    
    # Sort by title
    matching_recipes.sort(key=lambda r: r.title.lower())
    
    return matching_recipes

@router.get("/random", response_model=Recipe)
async def get_random_recipe(db: Session = Depends(get_db)) -> Recipe:
    """
    Get a random recipe.
    
    Returns a randomly selected recipe from the database.
    """
    # Get all recipes
    recipes = db.query(RecipeModel).all()
    
    if not recipes:
        raise HTTPException(status_code=404, detail="No recipes available")
    
    # Select random recipe
    random_recipe = random.choice(recipes)
    
    return random_recipe

@router.get("/{recipe_id}", response_model=LegacyRecipeDetail)
async def get_recipe(
    request: Request,
    recipe_id: str = Path(..., description="Recipe ID"),
    db: Session = Depends(get_db)
) -> LegacyRecipeDetail:
    """
    Get a specific recipe by ID in the legacy detail shape.

    Returns 200 with LegacyRecipeDetail or 404 if not found.
    """
    try:
        client_addr = request.client.host if request.client else 'unknown'
        logger.info("Received recipe detail request for id=%s from %s", recipe_id, client_addr)

        detail = fetch_by_id_for_legacy(db, recipe_id)
        if detail is None:
            logger.info("Recipe not found: %s", recipe_id)
            raise HTTPException(status_code=404, detail=f"Recipe with id '{recipe_id}' not found")

        logger.info("Returning recipe detail for id=%s to %s", recipe_id, client_addr)
        return detail
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to fetch recipe detail for %s: %s", recipe_id, str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve recipe")




