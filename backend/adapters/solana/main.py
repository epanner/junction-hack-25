# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from solana.models import AnchorRequest, AnchorRecord
from solana.service import (
    anchor_plan_dummy,
    get_anchor,
    make_hardcoded_plan,
)


app = FastAPI(title="TrustBridge Backend - Solana Trust Anchor Demo")


@app.post("/anchor/plan", response_model=AnchorRecord)
def anchor_plan(req: AnchorRequest):
    """
    Anchor a plain negotiated charging plan (provided by client) using the dummy "Solana" implementation.
    """
    record = anchor_plan_dummy(session_id=req.session_id, plan_record=req.plan_record)
    return record


@app.post("/anchor/plan/hardcoded", response_model=AnchorRecord)
def anchor_hardcoded_plan():
    """
    Convenience endpoint:
    - Generates a hardcoded synthetic charging plan
    - Anchors it
    - Returns the anchor record
    """
    session_id = "session-123"
    plan_record = make_hardcoded_plan(session_id=session_id)
    record = anchor_plan_dummy(session_id=session_id, plan_record=plan_record)
    return record


@app.get("/anchor/{session_id}", response_model=AnchorRecord)
def get_plan_anchor(session_id: str):
    """
    Retrieve existing anchor information for a given session_id.
    """
    record = get_anchor(session_id)
    if record is None:
        raise HTTPException(status_code=404, detail="No anchor found for this session_id")
    return record
