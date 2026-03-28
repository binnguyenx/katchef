"""Recipe suggestions — mock now, swap for Gemini later."""

from __future__ import annotations

import hashlib
import re

from backend.config.settings import get_settings
from backend.models.schemas import (
    IngredientItem,
    RecipePreferences,
    RecipeSuggestRequest,
    RecipeSuggestResponse,
    RecipeSuggestion,
)

# (id_suffix, title, mins, summary, keywords, image_hint)
_CATALOG: list[tuple[str, str, int, str, frozenset[str], str | None]] = [
    (
        "tomato-egg",
        "Tomato Egg Stir-fry",
        15,
        "Quick, comforting, and perfect for using up pantry basics.",
        frozenset({"egg", "eggs", "tomato"}),
        "stir-fry",
    ),
    (
        "chicken-rice",
        "Chicken Fried Rice",
        20,
        "A fast one-pan meal that turns leftovers into dinner.",
        frozenset({"chicken", "rice", "onion"}),
        "fried-rice",
    ),
    (
        "omelette",
        "Green Veggie Omelette",
        10,
        "Light, protein-rich, and ideal for a clean fridge reset.",
        frozenset({"egg", "eggs", "onion"}),
        "omelette",
    ),
    (
        "wrap",
        "Savory Chicken Wrap",
        12,
        "Fresh, minimal prep, and easy to pack or serve immediately.",
        frozenset({"chicken", "tomato", "onion"}),
        "wrap",
    ),
    (
        "rice-bowl",
        "Onion Tomato Rice Bowl",
        18,
        "A simple bowl with warm flavors and a satisfying finish.",
        frozenset({"onion", "tomato", "rice"}),
        "bowl",
    ),
]


def _tokens(name: str) -> set[str]:
    parts = re.split(r"[^\w]+", name.lower())
    return {p for p in parts if len(p) > 1}


def _ingredient_tokens(items: list[IngredientItem]) -> set[str]:
    out: set[str] = set()
    for it in items:
        out |= _tokens(it.name)
    return out


def _score(keywords: frozenset[str], ing_tokens: set[str]) -> int:
    return len(keywords & ing_tokens)


def _stable_id(session_id: str | None, suffix: str) -> str:
    base = (session_id or "") + "|" + suffix
    h = hashlib.sha256(base.encode()).hexdigest()[:8]
    return f"{suffix}-{h}"


def _apply_max_time(
    recipes: list[RecipeSuggestion],
    prefs: RecipePreferences | None,
) -> list[RecipeSuggestion]:
    if not prefs or prefs.max_time_mins is None:
        return recipes
    cap = prefs.max_time_mins
    filtered = [r for r in recipes if r.estimated_time_mins <= cap]
    return filtered if filtered else recipes


def suggest_recipes(req: RecipeSuggestRequest) -> RecipeSuggestResponse:
    _ = get_settings()
    # Future: if not settings.mock_mode and settings.gemini_api_key: return _suggest_from_gemini(req)

    ing_tokens = _ingredient_tokens(req.ingredients)
    rows: list[tuple[int, RecipeSuggestion]] = []

    for suffix, title, mins, summary, keywords, hint in _CATALOG:
        score = _score(keywords, ing_tokens) if ing_tokens else 0
        overlap = sorted(keywords & ing_tokens) if ing_tokens else []
        used = overlap if overlap else sorted(keywords)[:3]
        rid = _stable_id(req.session_id, suffix)
        rows.append(
            (
                score,
                RecipeSuggestion(
                    id=rid,
                    title=title,
                    estimated_time_mins=mins,
                    summary=summary,
                    ingredients_used=used,
                    image_hint=hint,
                ),
            )
        )

    rows.sort(key=lambda x: (-x[0], x[1].title))
    picked = [r for _, r in rows[:5]]
    picked = _apply_max_time(picked, req.preferences)

    return RecipeSuggestResponse(recipes=picked)
