"""Firestore persistence — no-op if MOCK_MODE or Firebase unavailable."""

from __future__ import annotations

import logging
import uuid
from typing import Any, Literal

from backend.config.settings import get_settings

logger = logging.getLogger(__name__)

Role = Literal["user", "assistant"]


def _mock_or_offline() -> bool:
    if get_settings().mock_mode:
        return True
    try:
        import firebase_admin

        firebase_admin.get_app()
    except ValueError:
        return True
    return False


def get_firestore_client() -> Any | None:
    if _mock_or_offline():
        return None
    try:
        from firebase_admin import firestore

        return firestore.client()
    except Exception as e:
        logger.warning("Firestore client unavailable: %s", e)
        return None


def _now_field(db: Any) -> Any:
    from firebase_admin import firestore

    return firestore.SERVER_TIMESTAMP


def _sid(session_id: str | None) -> str:
    return session_id if session_id else "anonymous"


def upsert_session(session_id: str | None, payload: dict[str, Any]) -> None:
    db = get_firestore_client()
    if db is None:
        return
    sid = _sid(session_id)
    ref = db.collection("sessions").document(sid)
    try:
        snap = ref.get()
        data: dict[str, Any] = {
            "session_id": sid,
            "updated_at": _now_field(db),
            **payload,
        }
        if not snap.exists:
            data["created_at"] = _now_field(db)
        ref.set(data, merge=True)
    except Exception as e:
        logger.warning("upsert_session failed: %s", e)


def save_scan_result(
    session_id: str | None,
    ingredients: list[Any],
    *,
    source: str = "vision",
) -> None:
    db = get_firestore_client()
    if db is None:
        logger.warning("save_scan_result: Firestore client is None (mock_mode or Firebase offline) — ingredients NOT saved")
        return
    sid = _sid(session_id)
    ing_payload = _ingredients_to_firestore(ingredients)
    scan_id = uuid.uuid4().hex
    try:
        db.collection("scans").document(scan_id).set(
            {
                "session_id": sid if session_id else None,
                "ingredients": ing_payload,
                "source": source,
                "created_at": _now_field(db),
            }
        )
        upsert_session(
            session_id,
            {"last_scan_ingredients": ing_payload},
        )
    except Exception as e:
        logger.warning("save_scan_result failed: %s", e)


def save_chat_message(session_id: str | None, role: Role, content: str) -> None:
    db = get_firestore_client()
    if db is None:
        return
    sid = _sid(session_id)
    try:
        msg_id = uuid.uuid4().hex
        db.collection("sessions").document(sid).collection("messages").document(msg_id).set(
            {
                "role": role,
                "content": content,
                "created_at": _now_field(db),
            }
        )
        preview = content[:500] if len(content) > 500 else content
        upsert_session(
            session_id,
            {"last_chat_message": preview},
        )
    except Exception as e:
        logger.warning("save_chat_message failed: %s", e)


def save_recipe_suggestions(session_id: str | None, recipes: list[Any]) -> None:
    db = get_firestore_client()
    if db is None:
        return
    sid = _sid(session_id)
    try:
        serialized: list[dict[str, Any]] = []
        for r in recipes:
            if hasattr(r, "model_dump"):
                serialized.append(r.model_dump())
            elif isinstance(r, dict):
                serialized.append(r)
            else:
                serialized.append({"raw": str(r)})

        for rec in serialized:
            rid = uuid.uuid4().hex
            db.collection("recipes").document(rid).set(
                {
                    "session_id": sid if session_id else None,
                    "title": rec.get("title", ""),
                    "estimated_time_mins": rec.get("estimated_time_mins", 0),
                    "summary": rec.get("summary", ""),
                    "ingredients_used": rec.get("ingredients_used", []),
                    "created_at": _now_field(db),
                }
            )

        upsert_session(
            session_id,
            {"last_recipe_suggestions": serialized},
        )
    except Exception as e:
        logger.warning("save_recipe_suggestions failed: %s", e)


def get_last_scan_ingredients(session_id: str | None) -> list[Any]:
    """Return IngredientItem-compatible dicts from sessions/{sid}.last_scan_ingredients."""
    db = get_firestore_client()
    if db is None:
        return []
    sid = _sid(session_id)
    try:
        snap = db.collection("sessions").document(sid).get()
        if not snap.exists:
            return []
        data = snap.to_dict() or {}
        raw = data.get("last_scan_ingredients") or []
        if not isinstance(raw, list):
            return []
        return raw
    except Exception as e:
        logger.warning("get_last_scan_ingredients failed: %s", e)
        return []


def get_session_history(session_id: str | None, *, limit: int = 50) -> list[dict[str, Any]]:
    db = get_firestore_client()
    if db is None:
        return []
    sid = _sid(session_id)
    try:
        col = (
            db.collection("sessions")
            .document(sid)
            .collection("messages")
            .order_by("created_at")
            .limit(limit)
        )
        out: list[dict[str, Any]] = []
        for doc in col.stream():
            d = doc.to_dict() or {}
            created = d.get("created_at")
            if created is not None and hasattr(created, "isoformat"):
                created = created.isoformat()
            out.append(
                {
                    "id": doc.id,
                    "role": d.get("role"),
                    "content": d.get("content", ""),
                    "created_at": created,
                }
            )
        return out
    except Exception as e:
        logger.warning("get_session_history failed: %s", e)
        return []


def _ingredients_to_firestore(ingredients: list[Any]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for item in ingredients:
        if hasattr(item, "model_dump"):
            out.append(item.model_dump())
        elif isinstance(item, dict):
            out.append(
                {
                    "name": str(item.get("name", "")),
                    "quantity": item.get("quantity"),
                    "confidence": item.get("confidence"),
                }
            )
        else:
            out.append({"name": str(item), "quantity": None, "confidence": None})
    return out
