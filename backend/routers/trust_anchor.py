from typing import Any, Dict, List, Literal, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from data.solana_anchor_models import AnchorRecord
from services.solana_anchor import (
    SolanaAnchorError,
    SolanaAnchorExecutionError,
    SolanaAnchorUnavailable,
    solana_anchor_service,
)


class AnchorPlanRequest(BaseModel):
    plan_record: Dict[str, Any] = Field(..., description="Plain negotiated plan JSON")
    force_reanchor: bool = Field(
        default=False,
        description="When false, returns existing anchors instead of re-sending to Solana",
    )


class AnchorResponse(BaseModel):
    status: Literal["anchored", "already_anchored"]
    anchor: AnchorRecord


class AnchorErrorDetail(BaseModel):
    code: str
    message: str
    detail: Optional[str] = None


router = APIRouter(prefix="/api/trust-anchor", tags=["trust-anchor"])


def _raise_http_error(status_code: int, exc: SolanaAnchorError):
    detail = AnchorErrorDetail(code=exc.code, message=exc.message, detail=exc.detail)
    raise HTTPException(status_code=status_code, detail=detail.model_dump()) from exc


@router.get("/", response_model=List[AnchorRecord])
async def list_anchors() -> List[AnchorRecord]:
    return solana_anchor_service.list_anchors()


@router.post("/{session_id}", response_model=AnchorResponse)
async def anchor_plan(session_id: str, payload: AnchorPlanRequest) -> AnchorResponse:
    existing = solana_anchor_service.get_anchor(session_id)
    if existing and not payload.force_reanchor:
        return AnchorResponse(status="already_anchored", anchor=existing)

    try:
        anchor = solana_anchor_service.anchor_plan(
            session_id=session_id,
            plan_record=payload.plan_record,
        )
    except SolanaAnchorUnavailable as exc:
        _raise_http_error(503, exc)
    except SolanaAnchorExecutionError as exc:
        _raise_http_error(502, exc)

    return AnchorResponse(status="anchored", anchor=anchor)


@router.get("/{session_id}", response_model=AnchorRecord)
async def get_anchor(session_id: str) -> AnchorRecord:
    record = solana_anchor_service.get_anchor(session_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail={"code": "anchor_not_found", "message": "No anchor stored for this session"},
        )
    return record


@router.post("/demo/hardcoded", response_model=AnchorResponse)
async def anchor_demo_plan() -> AnchorResponse:
    try:
        plan = solana_anchor_service.make_hardcoded_plan()
        anchor = solana_anchor_service.anchor_plan(
            session_id=plan["session_id"],
            plan_record=plan,
        )
        return AnchorResponse(status="anchored", anchor=anchor)
    except SolanaAnchorUnavailable as exc:
        _raise_http_error(503, exc)
    except SolanaAnchorExecutionError as exc:
        _raise_http_error(502, exc)


