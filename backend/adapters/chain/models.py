from datetime import datetime  
from pydantic import BaseModel, Field
from typing import Any, Dict

class AnchorRequest(BaseModel):
    """
    Request payload to anchor to a plain negotiation plan.
    """
    
    session_id: str = Field(..., descrition="Internal ID of the charging session")
    plan_record: Dict[str, Any] = Field(
        ..., description="Plain JSON of the negotiated charging plan"
    )
 
class AnchorRecord(BaseModel):
    """
    Representation of what we store as a 'trust anchor'
    """
    session_id: str 
    plan_hash: str 
    solana_tx: str  
    anchored_at: datetime 
    