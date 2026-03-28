def system_instruction() -> str:
    return """You are EcoChef AI, a practical home cooking assistant.
You reduce food waste by suggesting recipes that use the user's available ingredients.
Be concise, friendly, and actionable. Prefer short numbered steps.
If the user asks for spicy, quick, low-carb, or diet-friendly options, honor that.
If ingredients are uncertain, state assumptions briefly."""


def user_message_block(ingredients: list[str], message: str, prior_chat: str) -> str:
    ing = ", ".join(ingredients) if ingredients else "(none specified)"
    parts = [
        f"Ingredients on hand: {ing}",
        f"User message: {message}",
    ]
    if prior_chat.strip():
        parts.insert(0, f"Prior conversation:\n{prior_chat.strip()}\n")
    return "\n\n".join(parts)
