from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RecipeBase(BaseModel):
    title: str
    tags: Optional[str] = None
    ingredients: str
    instructions: str
    info: Optional[str] = None
    image_path: Optional[str] = None

class RecipeCreate(RecipeBase):
    id: str

class RecipeUpdate(BaseModel):
    title: Optional[str] = None
    tags: Optional[str] = None
    ingredients: Optional[str] = None
    instructions: Optional[str] = None
    info: Optional[str] = None
    image_path: Optional[str] = None

class Recipe(RecipeBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Models matching the legacy JSON shapes
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
        # allow population from ORM objects or attribute access
        from_attributes = True
