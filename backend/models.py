from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(String, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    ingredients = Column(Text, nullable=True)   # note: provided schema allows NULL
    instructions = Column(Text, nullable=True)
    info = Column(Text, nullable=True)

    # Relationship to tags
    tags = relationship("RecipeTag", back_populates="recipe", cascade="all, delete-orphan")

class RecipeTag(Base):
    __tablename__ = "recipe_tags"

    recipe_id = Column(String, ForeignKey("recipes.id", ondelete="CASCADE"), primary_key=True)
    tag = Column(String, primary_key=True, index=True)

    recipe = relationship("Recipe", back_populates="tags")
