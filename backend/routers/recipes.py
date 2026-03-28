from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException

from backend.models.schemas import IngredientItem, RecipeSuggestRequest, RecipeSuggestResponse
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


@router.post("/suggest", response_model=RecipeSuggestResponse)
async def suggest(body: RecipeSuggestRequest) -> RecipeSuggestResponse:
    ingredients = list(body.ingredients)
    if not ingredients:
        raw = get_last_scan_ingredients(body.session_id)
        ingredients = _ingredients_from_firestore(raw)
        if not ingredients:
            raise HTTPException(
                status_code=404,
                detail="No saved ingredients for this session. Call POST /api/vision/ingredients first with the same session_id, or send ingredients in the request body.",
            )

    req = body.model_copy(update={"ingredients": ingredients})
    result = suggest_recipes(req)
    save_recipe_suggestions(body.session_id, result.recipes)
    return result
