from database import SessionLocal
from models import Recipe, RecipeTag


def test_search_returns_list(client):
    response = client.get("/api/search")

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) > 0


def test_search_by_existing_title(client):
    db = SessionLocal()

    recipe = db.query(Recipe).first()

    assert recipe is not None

    word = recipe.title.split()[0]

    db.close()

    response = client.get("/api/search", params={"q": word})

    assert response.status_code == 200

    results = response.json()

    assert len(results) > 0
    assert any(item["name"] == recipe.title for item in results)


def test_search_unknown_title(client):
    response = client.get(
        "/api/search",
        params={"q": "__this_recipe_should_not_exist__"},
    )

    assert response.status_code == 200
    assert response.json() == []


def test_search_by_tag(client):
    db = SessionLocal()

    tag = db.query(RecipeTag).first()

    if tag is None:
        db.close()
        return

    response = client.get(
        "/api/search",
        params={"tags": tag.tag},
    )

    db.close()

    assert response.status_code == 200

    results = response.json()

    assert len(results) > 0
