import firebase_admin
from firebase_admin import credentials, firestore
from config import settings
from typing import List, Dict, Any

firebase_app = None
db = None

def initialize_firebase():
    """Initialize Firebase connection."""
    global firebase_app, db
    
    if firebase_app is not None:
        return db
    
    try:
        # Try to initialize with credentials file
        cred = credentials.Certificate('firebase_credentials.json')
        firebase_app = firebase_admin.initialize_app(cred)
    except (FileNotFoundError, ValueError):
        # Fall back to configuration from settings
        firebase_config = settings.firebase_config
        if not firebase_config["projectId"]:
            raise ValueError("Firebase credentials not configured. Please set environment variables or provide firebase_credentials.json")
        
        # Initialize with default credentials (requires GOOGLE_APPLICATION_CREDENTIALS env var)
        firebase_app = firebase_admin.initialize_app()
    
    db = firestore.client()
    return db

def get_firebase_db():
    """Get Firebase database instance."""
    global db
    if db is None:
        initialize_firebase()
    return db

def fetch_recipes_from_firebase() -> List[Dict[str, Any]]:
    """Fetch all recipes from Firebase Firestore."""
    db = get_firebase_db()
    recipes = []
    
    try:
        docs = db.collection('recipes').stream()
        for doc in docs:
            recipe_data = doc.to_dict()
            recipe_data['id'] = doc.id
            recipes.append(recipe_data)
    except Exception as e:
        raise Exception(f"Failed to fetch recipes from Firebase: {str(e)}")
    
    return recipes
