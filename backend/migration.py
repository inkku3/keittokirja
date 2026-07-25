from sqlalchemy.orm import Session
from models import Recipe as RecipeModel
from firebase_client import fetch_recipes_from_firebase
from typing import Dict, Any

def migrate_recipes_from_firebase(db: Session) -> Dict[str, Any]:
    """
    Migrate recipes from Firebase to PostgreSQL.
    
    Returns migration statistics.
    """
    stats = {
        "total_fetched": 0,
        "successfully_migrated": 0,
        "failed": [],
        "skipped": []
    }
    
    try:
        firebase_recipes = fetch_recipes_from_firebase()
        stats["total_fetched"] = len(firebase_recipes)
    except Exception as e:
        stats["failed"].append({"error": str(e)})
        return stats
    
    for recipe_data in firebase_recipes:
        try:
            recipe_id = recipe_data.get('id')
            
            # Check if recipe already exists
            existing = db.query(RecipeModel).filter(RecipeModel.id == recipe_id).first()
            if existing:
                stats["skipped"].append({"id": recipe_id, "reason": "Already exists"})
                continue
            
            # Map Firebase data to our Recipe model
            recipe = RecipeModel(
                id=recipe_id,
                title=recipe_data.get('title', 'Unknown'),
                tags=recipe_data.get('tags', ''),
                ingredients=recipe_data.get('ingredients', ''),
                instructions=recipe_data.get('instructions', ''),
                info=recipe_data.get('info', ''),
                image_path=f"recipes/img/{recipe_id}"  # Assume image naming convention
            )
            
            db.add(recipe)
            db.commit()
            stats["successfully_migrated"] += 1
            
        except Exception as e:
            db.rollback()
            stats["failed"].append({
                "id": recipe_data.get('id', 'unknown'),
                "error": str(e)
            })
    
    return stats
