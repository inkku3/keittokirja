from pydantic import BaseModel
from typing import Optional, List

# Base recipe – matches database columns
class RecipeBase(BaseModel):
    title: str
    ingredients: Optional[str] = None
    instructions: Optional[str] = None
    info: Optional[str] = None
    # tags will be handled separately (via list or string)

class RecipeCreate(RecipeBase):
    id: str
    tags: Optional[List[str]] = None   # optional list of tags

class RecipeUpdate(BaseModel):
    title: Optional[str] = None
    ingredients: Optional[str] = None
    instructions: Optional[str] = None
    info: Optional[str] = None
    tags: Optional[List[str]] = None

class Recipe(RecipeBase):
    id: str
    tags: Optional[str] = None   # comma-separated string for frontend compatibility
    image_path: Optional[str] = None   # not in DB, but kept for frontend
    created_at: Optional[str] = None   # not in DB
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

# Legacy search item – unchanged
class LegacySearchItem(BaseModel):
    name: str
    url: str
    tags: Optional[str] = None
    image_path: Optional[str] = None

class LegacyListItem(BaseModel):
    name: str
    url: str
    image_path: Optional[str] = None

class LegacyRecipeDetail(BaseModel):
    title: str
    ingredients: str
    instructions: str
    info: Optional[str] = None
    image_path: Optional[str] = None

    class Config:
        from_attributes = True
