from __future__ import annotations

import os
from threading import Lock
from typing import Any, Dict, List, Optional

from data.solana_anchor_models import AnchorRecord
from config import settings


class SolanaAnchorError(RuntimeError):
    def __init__(self, code: str, message: str, detail: Optional[str] = None) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.detail = detail


class SolanaAnchorUnavailable(SolanaAnchorError):
    """Raised when the Solana anchoring stack is not ready to be used."""


class SolanaAnchorExecutionError(SolanaAnchorError):
    """Raised when the Solana RPC transaction fails."""


class SolanaAnchorService:
    def __init__(self) -> None:
        self._impl = None
        self._init_error: Optional[Exception] = None
        self._lock = Lock()

    def _ensure_impl(self):
        if self._impl:
            return
        if self._init_error:
            raise SolanaAnchorUnavailable(
                code="solana_unavailable",
                message="Solana anchoring unavailable",
                detail=str(self._init_error),
            ) from self._init_error

        if not settings.solana_enabled:
            raise SolanaAnchorUnavailable(
                code="solana_disabled",
                message="Solana anchoring disabled via configuration",
            )

        if not settings.solana_keypair_path:
            raise SolanaAnchorUnavailable(
                code="missing_keypair_path",
                message="Missing solana_keypair_path configuration",
                detail="Set SOLANA_KEYPAIR_PATH env var to the solana-keygen JSON key",
            )

        with self._lock:
            if self._impl:
                return
            if self._init_error:
                raise SolanaAnchorUnavailable(
                    code="solana_unavailable",
                    message="Solana anchoring unavailable",
                    detail=str(self._init_error),
                ) from self._init_error

            try:
                # Ensure the adapter sees the correct environment
                os.environ.setdefault("SOLANA_RPC_URL", settings.solana_rpc_url)
                os.environ.setdefault("SOLANA_KEYPAIR_PATH", settings.solana_keypair_path)

                from adapters.chain import services as chain_services

                self._impl = chain_services
            except Exception as exc:  # pylint: disable=broad-except
                self._init_error = exc
                raise SolanaAnchorUnavailable(
                    code="solana_init_failed",
                    message="Failed to initialize Solana services",
                    detail=str(exc),
                ) from exc

    def anchor_plan(self, session_id: str, plan_record: Dict[str, Any]) -> AnchorRecord:
        self._ensure_impl()
        assert self._impl  # for mypy
        try:
            return self._impl.anchor_plan_on_solana(session_id=session_id, plan_record=plan_record)
        except SolanaAnchorError:
            raise
        except RuntimeError as exc:
            raise SolanaAnchorExecutionError(
                code="solana_tx_failed",
                message="Failed to anchor plan on Solana",
                detail=str(exc),
            ) from exc

    def get_anchor(self, session_id: str) -> Optional[AnchorRecord]:
        try:
            self._ensure_impl()
        except SolanaAnchorUnavailable:
            return None
        assert self._impl
        return self._impl.get_anchor(session_id)

    def list_anchors(self) -> List[AnchorRecord]:
        try:
            self._ensure_impl()
        except SolanaAnchorUnavailable:
            return []
        assert self._impl
        store = getattr(self._impl, "ANCHOR_STORE", {})
        return list(store.values())

    def make_hardcoded_plan(self, session_id: Optional[str] = None) -> Dict[str, Any]:
        self._ensure_impl()
        assert self._impl
        if session_id:
            return self._impl.make_hardcoded_plan(session_id=session_id)
        return self._impl.make_hardcoded_plan()


solana_anchor_service = SolanaAnchorService()
