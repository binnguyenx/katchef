from fastapi import APIRouter

from backend.models.schemas import ChatRequest, ChatResponse
from backend.services.chatbot_service import generate_chef_reply
from backend.services.firebase_service import save_chat_message

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chef_chat(body: ChatRequest) -> ChatResponse:
    save_chat_message(body.session_id, "user", body.message)
    reply = generate_chef_reply(
        ingredients=body.ingredients,
        message=body.message,
        session_id=body.session_id,
    )
    save_chat_message(body.session_id, "assistant", reply)
    return ChatResponse(reply=reply, recipe=None)
