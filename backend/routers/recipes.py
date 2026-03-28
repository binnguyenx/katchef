from fastapi import APIRouter

from backend.models.schemas import RecipeSuggestRequest, RecipeSuggestResponse
from backend.services.firebase_service import save_recipe_suggestions
from backend.services.recipe_service import suggest_recipes

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.post("/suggest", response_model=RecipeSuggestResponse)
async def suggest(body: RecipeSuggestRequest) -> RecipeSuggestResponse:
    result = suggest_recipes(body)
    save_recipe_suggestions(body.session_id, result.recipes)
    return result
