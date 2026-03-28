"""Ingredients + user message → Gemini reply (or mock)."""

from __future__ import annotations

import logging

import google.generativeai as genai

from ai.chatbot.chain import format_history, record_turn
from ai.chatbot.prompts import system_instruction, user_message_block
from backend.config.settings import get_settings

logger = logging.getLogger(__name__)

MOCK_REPLY = """Here's a quick idea using what you have:

**Tomato Egg Stir-fry**
1. Beat eggs with a pinch of salt.
2. Sauté tomato until soft, season lightly.
3. Pour eggs, scramble gently until just set.
4. Serve hot.

(Replace with real Gemini output when GEMINI_API_KEY is set.)"""


def generate_chef_reply(
    *,
    ingredients: list[str],
    message: str,
    session_id: str | None,
) -> str:
    settings = get_settings()
    if settings.mock_mode or not settings.gemini_api_key.strip():
        record_turn(session_id, message, MOCK_REPLY)
        return MOCK_REPLY

    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(
        settings.gemini_model,
        system_instruction=system_instruction(),
    )

    prior = format_history(session_id)
    prompt = user_message_block(ingredients, message, prior)

    try:
        response = model.generate_content(prompt)
        text = (response.text or "").strip()
        if not text:
            text = MOCK_REPLY
        record_turn(session_id, message, text)
        return text
    except Exception as e:
        logger.exception("Gemini failed: %s", e)
        record_turn(session_id, message, MOCK_REPLY)
        return MOCK_REPLY
