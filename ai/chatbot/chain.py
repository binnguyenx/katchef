"""Lightweight in-memory chat history per session (dev / hackathon). Replace with Redis/Firestore later."""

from __future__ import annotations

from collections import defaultdict

_sessions: dict[str, list[tuple[str, str]]] = defaultdict(list)
_MAX_TURNS = 8


def _sid(session_id: str | None) -> str:
    return session_id or "_default"


def format_history(session_id: str | None) -> str:
    lines: list[str] = []
    for user_msg, assistant_msg in _sessions[_sid(session_id)]:
        lines.append(f"User: {user_msg}\nChef: {assistant_msg}")
    return "\n\n".join(lines)


def record_turn(session_id: str | None, user_message: str, assistant_message: str) -> None:
    sid = _sid(session_id)
    _sessions[sid].append((user_message, assistant_message))
    if len(_sessions[sid]) > _MAX_TURNS:
        _sessions[sid] = _sessions[sid][-_MAX_TURNS:]
