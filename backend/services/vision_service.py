"""Image → ingredients via Google Cloud Vision (or mock)."""

from __future__ import annotations

import io
import logging
import os

from backend.config.settings import get_settings

logger = logging.getLogger(__name__)

MOCK_INGREDIENTS = ["2 Eggs", "1 Tomato", "Leftover Chicken", "Half Onion"]


def _ensure_vision_credentials() -> None:
    creds = get_settings().google_application_credentials
    if creds and not os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = creds


def detect_ingredients_from_image(image_bytes: bytes) -> list[str]:
    settings = get_settings()
    if settings.mock_mode:
        return list(MOCK_INGREDIENTS)

    _ensure_vision_credentials()

    try:
        from google.cloud import vision

        client = vision.ImageAnnotatorClient()
        image = vision.Image(content=image_bytes)
        response = client.label_detection(image=image, max_results=25)
        if response.error.message:
            logger.error("Vision API error: %s", response.error.message)
            return list(MOCK_INGREDIENTS)

        labels = [a.description for a in response.label_annotations if a.description]
        # Heuristic: treat labels as rough “ingredients”; refine later with Gemini.
        cleaned = [l for l in labels if len(l) > 1][:12]
        return cleaned if cleaned else list(MOCK_INGREDIENTS)
    except Exception as e:
        logger.exception("Vision call failed, using mock: %s", e)
        return list(MOCK_INGREDIENTS)
