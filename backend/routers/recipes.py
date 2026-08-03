from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from database import get_db
from models import Recipe as RecipeModel, RecipeTag
from schemas import Recipe, RecipeCreate, RecipeUpdate, LegacyListItem

router = APIRouter(prefix="/api/recipes", tags=["recipes"])

def recipe_to_schema(recipe_model: RecipeModel) -> Recipe:
    """Convert ORM model to response schema, aggregating tags as comma-separated string."""
    tags_list = [tag.tag for tag in recipe_model.tags]
    tags_str = ",".join(tags_list) if tags_list else None
    return Recipe(
        id=recipe_model.id,
        title=recipe_model.title,
        ingredients=recipe_model.ingredients,
        instructions=recipe_model.instructions,
        info=recipe_model.info,
        tags=tags_str,
        image_path=None,   # not stored in DB
        created_at=None,
        updated_at=None,
    )

@router.get("/", response_model=List[Recipe])
def list_recipes(
    sort_by: str = Query("title", regex="^(title|id)$"),
    order: str = Query("asc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    query = db.query(RecipeModel)
    if sort_by == "title":
        order_col = RecipeModel.title
    else:
        order_col = RecipeModel.id
    if order == "desc":
        query = query.order_by(order_col.desc())
    else:
        query = query.order_by(order_col.asc())
    recipes = query.all()
    return [recipe_to_schema(r) for r in recipes]

@router.get("/{recipe_id}", response_model=Recipe)
def get_recipe(recipe_id: str, db: Session = Depends(get_db)):
    recipe = db.query(RecipeModel).filter(RecipeModel.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe_to_schema(recipe)

# Legacy list endpoint (returns name, url, image_path)
@router.get("/legacy", response_model=List[LegacyListItem])
def legacy_list(db: Session = Depends(get_db)):
    recipes = db.query(RecipeModel).all()
    return [
        LegacyListItem(
            name=r.title,
            url=f"recipes/{r.id}",
            image_path=None
        ) for r in recipes
    ]

# Filter by tags – expects comma-separated tag list
@router.get("/filter", response_model=List[Recipe])
def filter_by_tags(
    tags: str = Query(..., description="Comma-separated list of tags"),
    db: Session = Depends(get_db),
):
    tag_list = [t.strip() for t in tags.split(",") if t.strip()]
    if not tag_list:
        # If no valid tags, return all recipes (or empty)
        return list_recipes(db=db)
    # Find recipes that have ALL given tags (AND logic)
    subq = db.query(RecipeTag.recipe_id).filter(RecipeTag.tag.in_(tag_list)) \
             .group_by(RecipeTag.recipe_id) \
             .having(func.count(RecipeTag.tag) == len(tag_list))
    recipe_ids = [row[0] for row in subq.all()]
    if not recipe_ids:
        return []
    recipes = db.query(RecipeModel).filter(RecipeModel.id.in_(recipe_ids)).all()
    return [recipe_to_schema(r) for r in recipes]

# Random recipe
@router.get("/random", response_model=Recipe)
def random_recipe(db: Session = Depends(get_db)):
    recipe = db.query(RecipeModel).order_by(func.random()).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="No recipes found")
    return recipe_to_schema(recipe)

# Update/create endpoints – adjust accordingly
# ... (omitted for brevity)
