from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class IngredientItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str = Field(min_length=1, description="Detected ingredient or food item name")
    quantity: str | None = Field(default=None, description="Optional human-readable amount")
    confidence: float | None = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Model confidence score when available",
    )


class IngredientScanResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    ingredients: list[IngredientItem] = Field(default_factory=list)


class RecipePreferences(BaseModel):
    model_config = ConfigDict(extra="ignore")

    max_time_mins: int | None = Field(default=None, ge=1, description="Upper bound on cook time")
    diet: str | None = Field(default=None, description="e.g. low-carb, vegan")
    style: str | None = Field(default=None, description="e.g. quick, spicy, one-pan")


class RecipeSuggestion(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(min_length=1)
    title: str = Field(min_length=1)
    estimated_time_mins: int = Field(ge=1)
    summary: str = Field(min_length=1)
    ingredients_used: list[str] = Field(default_factory=list)
    image_hint: str | None = None


class RecipeSuggestRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    ingredients: list[IngredientItem] = Field(default_factory=list)
    preferences: RecipePreferences | None = None
    session_id: str | None = None


class RecipeSuggestResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    recipes: list[RecipeSuggestion] = Field(default_factory=list)


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    session_id: str | None = None
    ingredients: list[str] = Field(default_factory=list)
    message: str = Field(min_length=1)


class ChatRecipe(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str = Field(min_length=1)
    estimated_time_mins: int = Field(ge=1)
    steps: list[str] = Field(default_factory=list, min_length=1)


class ChatResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    reply: str = Field(min_length=1)
    recipe: ChatRecipe | None = None
