from database import SessionLocal
from models import Recipe


def test_recipe_list(client):
    response = client.get("/api/recipes/")

    assert response.status_code == 200

    recipes = response.json()

    assert isinstance(recipes, list)
    assert len(recipes) > 0

    recipe = recipes[0]

    assert "name" in recipe
    assert "url" in recipe
    assert "image_path" in recipe


def test_get_recipe_detail(client):
    db = SessionLocal()

    recipe = db.query(Recipe).first()

    assert recipe is not None

    response = client.get(f"/api/recipes/{recipe.id}")

    db.close()

    assert response.status_code == 200

    data = response.json()

    assert data["title"] == recipe.title
    assert "ingredients" in data
    assert "instructions" in data
    assert "image_path" in data


def test_get_missing_recipe(client):
    response = client.get("/api/recipes/__does_not_exist__")

    assert response.status_code == 404


def test_random_recipe(client):
    response = client.get("/api/recipes/random")

    assert response.status_code == 200

    recipe = response.json()

    assert "id" in recipe
    assert "title" in recipe
    assert "ingredients" in recipe
    assert "instructions" in recipe
