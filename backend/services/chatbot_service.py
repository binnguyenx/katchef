import os
from dotenv import load_dotenv
from google import genai
from ai.chatbot.prompts import SYSTEM_PROMPT, build_prompt

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def chat(message: str, ingredients: list[str]) -> str:
    prompt = build_prompt(ingredients, message)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=genai.types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
        ),
    )
    return response.text
