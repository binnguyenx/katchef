"""Ingredients from Firebase → Gemini → recipe suggestions."""

from __future__ import annotations

import json
import logging

import google.generativeai as genai

from ai.recipes.prompts import RECIPE_SYSTEM_PROMPT, recipe_prompt
from backend.config.settings import get_settings
from backend.models.schemas import (
    RecipeSuggestRequest,
    RecipeSuggestResponse,
    RecipeSuggestion,
)

logger = logging.getLogger(__name__)

MOCK_RECIPES = [
    RecipeSuggestion(
        id="mock-1",
        title="Tomato Egg Stir-fry",
        estimated_time_mins=15,
        summary="Quick, comforting, and perfect for using up pantry basics.",
        ingredients_used=["eggs", "tomato"],
    ),
]


def suggest_recipes(req: RecipeSuggestRequest) -> RecipeSuggestResponse:
    settings = get_settings()
    ingredient_names = [item.name for item in req.ingredients]

    if settings.mock_mode or not settings.gemini_api_key.strip():
        return RecipeSuggestResponse(recipes=MOCK_RECIPES)

    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(
        settings.gemini_model,
        system_instruction=RECIPE_SYSTEM_PROMPT,
    )

    pref_parts = []
    if req.preferences:
        if req.preferences.diet:
            pref_parts.append(req.preferences.diet)
        if req.preferences.style:
            pref_parts.append(req.preferences.style)
        if req.preferences.max_time_mins:
            pref_parts.append(f"under {req.preferences.max_time_mins} minutes")
    preferences = ", ".join(pref_parts)

    prompt = recipe_prompt(ingredient_names, preferences)

    try:
        response = model.generate_content(prompt)
        text = (response.text or "").strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        raw_recipes = json.loads(text)
        recipes = []
        for i, r in enumerate(raw_recipes):
            recipes.append(
                RecipeSuggestion(
                    id=f"gemini-{i}",
                    title=r["title"],
                    estimated_time_mins=r["estimated_time_mins"],
                    summary=r["summary"],
                    ingredients_used=r.get("ingredients_used", []),
                )
            )
        return RecipeSuggestResponse(recipes=recipes)
    except Exception as e:
        logger.exception("Gemini recipe generation failed: %s", e)
        return RecipeSuggestResponse(recipes=MOCK_RECIPES)
