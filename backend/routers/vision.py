from fastapi import APIRouter, File, Form, UploadFile

from backend.models.schemas import IngredientItem, IngredientScanResponse
from backend.services.firebase_service import save_scan_result
from backend.services.vision_service import detect_ingredients_from_image

router = APIRouter(prefix="/vision", tags=["vision"])


@router.post("/ingredients", response_model=IngredientScanResponse)
async def ingredients_from_image(
    file: UploadFile = File(...),
    session_id: str | None = Form(None),
) -> IngredientScanResponse:
    data = await file.read()
    raw = detect_ingredients_from_image(data)
    items = [IngredientItem(name=label, quantity=None, confidence=None) for label in raw]
    save_scan_result(session_id, items)
    return IngredientScanResponse(ingredients=items)
