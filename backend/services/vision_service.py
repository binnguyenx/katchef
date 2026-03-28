import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

VISION_PROMPT = """Look at this fridge photo and list every food ingredient you can see.

Return ONLY a JSON array of strings, nothing else. Example: ["eggs", "milk", "tomato", "cheese"]

If you cannot identify any food items, return an empty array: []"""


def detect_ingredients(image_bytes: bytes) -> list[str]:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Content(
                parts=[
                    types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                    types.Part.from_text(text=VISION_PROMPT),
                ],
            ),
        ],
    )
    text = response.text.strip()
    # Clean markdown code fences if present
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    return json.loads(text)
