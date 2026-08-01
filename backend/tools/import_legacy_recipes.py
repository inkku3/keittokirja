#!/usr/bin/env python3
"""
Import legacy recipes from Firebase into the Postgres recipes table.

Behavior:
- Attempts to fetch recipes via backend.firebase_client.fetch_recipes_from_firebase().
- Connects to DB using backend.database.SessionLocal and inserts rows using backend.models.Recipe.
- If DATABASE_URL or Firebase credentials are missing, performs a dry-run and prints sample transformed rows.

Run: python backend/scripts/import_legacy_recipes.py
"""
import sys
import traceback
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'backend'))

try:
    from config import settings
    from firebase_client import fetch_recipes_from_firebase
    from database import SessionLocal, engine
    from models import Recipe as RecipeModel
except Exception as e:
    print("Warning: could not import full backend modules:", e)
    traceback.print_exc()
    print("Proceeding in dry-run mode. To enable real import, install backend dependencies and set DATABASE_URL and Firebase credentials.")
    fetch_recipes_from_firebase = None
    SessionLocal = None
    RecipeModel = None



def transform_recipe(firebase_doc: dict) -> dict:
    """Map firebase doc to DB row dict."""
    recipe_id = firebase_doc.get('id') or firebase_doc.get('doc_id') or firebase_doc.get('uuid')
    title = firebase_doc.get('title') or firebase_doc.get('name') or 'Untitled'
    tags_raw = firebase_doc.get('tags') or firebase_doc.get('tag') or ''

    # Normalize tags: try to split by comma or whitespace
    if isinstance(tags_raw, list):
        tags = [t.strip().lower() for t in tags_raw if t]
    else:
        tags = [t.strip().lower() for t in str(tags_raw).replace(';', ',').split(',') if t.strip()]

    ingredients = firebase_doc.get('ingredients', '')
    instructions = firebase_doc.get('instructions', '')
    info = firebase_doc.get('info') or firebase_doc.get('notes') or ''

    image_path = firebase_doc.get('image_path')
    if not image_path:
        image_path = f"recipes/img/{recipe_id}"

    return {
        'id': str(recipe_id),
        'title': title,
        'tags': tags,
        'ingredients': ingredients,
        'instructions': instructions,
        'info': info,
        'image_path': image_path,
    }


def run_import(dry_run=True):
    print('Starting import: dry_run=%s' % dry_run)

    try:
        firebase_recipes = fetch_recipes_from_firebase()
    except Exception as e:
        print('Could not fetch recipes from Firebase:', e)
        print('This usually means firebase credentials are not configured (see backend/.env or firebase_credentials.json).')
        print('\nPerforming dry-run sample transformation for demonstration...')
        sample = {
            'id': 'sample123',
            'title': 'Näyteresepti',
            'tags': 'pääruoka, kana',
            'ingredients': '1 kana\nSuolaa\nPippuria',
            'instructions': '1. Tee näin\n2. Paista',
            'info': 'Annoksia: 4',
        }
        transformed = transform_recipe(sample)
        print('\nSample transformed row:')
        for k, v in transformed.items():
            print(f'  {k}: {v}')
        return

    print(f'Fetched {len(firebase_recipes)} recipes from Firebase')

    transformed = [transform_recipe(doc) for doc in firebase_recipes]

    if dry_run:
        print('Dry run enabled — not writing to DB. Showing 5 transformed rows:')
        for row in transformed[:5]:
            print(row)
        print('\nTo write to DB, re-run with environment variable IMPORT_DRY_RUN=0')
        return

    # Write to DB
    session = SessionLocal()
    try:
        inserted = 0
        for row in transformed:
            # skip if id exists
            existing = session.query(RecipeModel).filter(RecipeModel.id == row['id']).first()
            if existing:
                print('Skipping existing id', row['id'])
                continue
            rec = RecipeModel(
                id=row['id'],
                title=row['title'],
                tags=','.join(row['tags']),
                ingredients=row['ingredients'],
                instructions=row['instructions'],
                info=row.get('info'),
                image_path=row.get('image_path'),
            )
            session.add(rec)
            session.commit()
            inserted += 1
        print(f'Inserted {inserted} new recipes')
    except Exception as e:
        print('Error while inserting into DB:', e)
        traceback.print_exc()
    finally:
        session.close()


if __name__ == '__main__':
    import os
    dry = os.environ.get('IMPORT_DRY_RUN', '1') != '0'
    run_import(dry_run=dry)
