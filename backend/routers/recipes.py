from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query

from backend.models.schemas import IngredientItem, RecipePreferences, RecipeSuggestRequest, RecipeSuggestResponse
from backend.services.firebase_service import get_last_scan_ingredients, save_recipe_suggestions
from backend.services.recipe_service import suggest_recipes

router = APIRouter(prefix="/recipes", tags=["recipes"])


def _ingredients_from_firestore(raw: list[Any]) -> list[IngredientItem]:
    out: list[IngredientItem] = []
    for x in raw:
        if not isinstance(x, dict):
            continue
        name = str(x.get("name", "")).strip()
        if not name:
            continue
        out.append(
            IngredientItem(
                name=name,
                quantity=x.get("quantity"),
                confidence=x.get("confidence"),
            )
        )
    return out


@router.get("/suggest", response_model=RecipeSuggestResponse)
async def suggest(
    session_id: str | None = Query(default=None, description="Session ID from the vision scan"),
    diet: str | None = Query(default=None, description="Dietary preference, e.g. vegan, low-carb"),
    style: str | None = Query(default=None, description="Cooking style, e.g. quick, spicy, one-pan"),
    max_time_mins: int | None = Query(default=None, ge=1, description="Max cook time in minutes"),
) -> RecipeSuggestResponse:
    """Fetch ingredients saved from the last vision scan and suggest recipes."""
    sid_label = session_id or "anonymous"
    raw = get_last_scan_ingredients(session_id)
    ingredients = _ingredients_from_firestore(raw)
    if not ingredients:
        raise HTTPException(
            status_code=404,
            detail=f"No saved ingredients for session '{sid_label}'. Call POST /api/vision/ingredients first.",
        )

    preferences = RecipePreferences(diet=diet, style=style, max_time_mins=max_time_mins)
    req = RecipeSuggestRequest(ingredients=ingredients, preferences=preferences, session_id=session_id)
    result = suggest_recipes(req)
    save_recipe_suggestions(session_id, result.recipes)
    return result
