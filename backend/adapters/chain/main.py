# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import AnchorRequest, AnchorRecord
from .services import (
    anchor_plan_on_solana,
    get_anchor,
    make_hardcoded_plan,
)


app = FastAPI(title="Solana Trust Anchor Demo")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/anchor/plan", response_model=AnchorRecord)
def anchor_plan(req: AnchorRequest):
    """
    Anchor a plain negotiated charging plan using a REAL Solana transaction.
    """
    try:
        record = anchor_plan_on_solana(session_id=req.session_id, plan_record=req.plan_record)
        return record
    except RuntimeError as e:
        # Wrap Solana errors in HTTP 500 with a useful message
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/anchor/plan/hardcoded", response_model=AnchorRecord)
def anchor_hardcoded_plan():
    """
    Convenience endpoint:
    - Generates a hardcoded synthetic charging plan
    - Anchors it on Solana
    - Returns the anchor record
    """
    session_id = "session-123"
    plan_record = make_hardcoded_plan(session_id=session_id)
    try:
        record = anchor_plan_on_solana(session_id=session_id, plan_record=plan_record)
        return record
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/anchor/{session_id}", response_model=AnchorRecord)
def get_plan_anchor(session_id: str):
    record = get_anchor(session_id)
    if record is None:
        raise HTTPException(status_code=404, detail="No anchor found for this session_id")
    return record