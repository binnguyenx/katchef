"""Firebase Admin init (optional). Safe no-op if credentials missing."""

from __future__ import annotations

import logging

from backend.config.settings import get_settings

logger = logging.getLogger(__name__)
_initialized = False


def init_firebase() -> None:
    global _initialized
    if _initialized:
        return
    path = get_settings().firebase_credentials_path
    if not path:
        logger.info("Firebase skipped: FIREBASE_CREDENTIALS_PATH not set")
        return
    try:
        import firebase_admin
        from firebase_admin import credentials

        try:
            firebase_admin.get_app()
        except ValueError:
            cred = credentials.Certificate(path)
            firebase_admin.initialize_app(cred)
        _initialized = True
        logger.info("Firebase initialized")
    except Exception as e:
        logger.warning("Firebase init failed: %s", e)
