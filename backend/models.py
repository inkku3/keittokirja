from sqlalchemy import Column, String, DateTime, func
from database import Base
from datetime import datetime

class Recipe(Base):
    __tablename__ = "recipes"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    tags = Column(String, nullable=True, index=True)
    ingredients = Column(String, nullable=False)
    instructions = Column(String, nullable=False)
    info = Column(String, nullable=True)
    image_path = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
