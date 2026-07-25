from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from migration import migrate_recipes_from_firebase
from typing import Dict, Any

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.post("/migrate/firebase")
async def migrate_from_firebase(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Migrate recipes from Firebase to PostgreSQL.
    
    This endpoint imports all recipes from Firebase Firestore into the local
    PostgreSQL database. Recipes that already exist in the database are skipped.
    """
    try:
        stats = migrate_recipes_from_firebase(db)
        return {
            "status": "completed",
            "data": stats
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Migration failed: {str(e)}"
        )
