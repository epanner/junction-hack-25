import json
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from .models import AnchorRecord

ANCHOR_STORE: Dict[str, AnchorRecord] = {}

def compute_plan_hash(plan: Dict[str, Any]) -> str:
    """
    Deterministic hash of a plan JSON
    sort_keys = True ensures same hash for same content.
    """
    plan_str = json.dumps(plan, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(plan_str.encode("utf-8")).hexdigest()

def anchor_plan_dummy(session_id: str, plan_record: Dict[str, Any]) -> AnchorRecord:
    """
    Dummy Solana anchor
    - Compute hash of the plain negotiation plan
    - Stores it in memory with a fake Solana tx id
    """
    plan_hash = compute_plan_hash(plan_record)
    record = AnchorRecord(
        session_id=session_id,
        plan_hash=plan_hash,
        solana_tx=f"SOLANA_TX_DUMMY_{session_id}",
        anchored_at=datetime.now(timezone.utc)
    )
    ANCHOR_STORE[session_id] = record
    print(len(ANCHOR_STORE))
    return record

def get_anchor(session_id: str) -> Optional[AnchorRecord]:
    return ANCHOR_STORE.get(session_id)

def make_hardcoded_plan(session_id: str = "session-123") -> Dict[str, Any]:
    """
    Hardcoded synthetic negotiation plan.
    This simulates the output the AI/ML + DID negotiation pipeline.
    """
    
    return {
        "session_id": session_id,
        "driver_did": "did:itn:user-abc",
        "vehicle_did": "did:itn:vehicle-xyz",
        "charger_did": "did:itn:charger-001",
        "site_id": "site-helsinki-hq",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "constraints": {
            "leave_by": "2025-11-14T15:00:00Z",
            "min_soc": 0.7,
            "current_soc": 0.4,
            "battery_capacity_kwh": 60.0,
            "grid_constrained_until": "2025-11-14T13:00:00Z",
            "max_power_kw": 11,
            "priority": "normal",
        },
        "plan": {
            "phases": [
                {
                    "phase": 1,
                    "from": "2025-11-14T11:05:00Z",
                    "to": "2025-11-14T13:00:00Z",
                    "power_kw": 3.0,
                    "reason": "Grid constrained, slow charge",
                },
                {
                    "phase": 2,
                    "from": "2025-11-14T13:00:00Z",
                    "to": "2025-11-14T14:30:00Z",
                    "power_kw": 11.0,
                    "reason": "Grid OK, fast top-up",
                },
            ],
            "expected_soc_at_departure": 0.72,
        },
        "ai_metadata": {
            "planner_version": "v0.1",
            "forecast_model": "simple_regression_v1",
            "explanation_summary": (
                "Slow charging until 13:00 due to grid stress, "
                "then full power to reach ~72% by 14:30."
            ),
        },
        # Optional — just for demo, can be fake IDs
        "denso_vc_refs": {
            "vehicle_vc_id": "urn:uuid:vehicle-vc-123",
            "charger_vc_id": "urn:uuid:charger-vc-456",
            "user_vc_id": "urn:uuid:user-vc-789",
            "negotiated_plan_vc_id": "urn:uuid:plan-vc-000",
        },
    }