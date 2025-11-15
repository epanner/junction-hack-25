import hashlib
from datetime import datetime
from typing import Any, Dict

from adapters.denso_did import DensoDIDClient
from data.vehicle_sessions import VEHICLE_SOC_HISTORY

SCHEMA_URI = "urn:cloudcharger:schemas:ocpi-session-envelope:1"
ENVELOPE_VERSION = "1.0.0"

# Deterministic IDs -> same VIN + timestamps always produce the same envelope_id and session_id
def _hash_identifier(*parts: str) -> str:
    digest = hashlib.sha256("::".join(parts).encode("utf-8")).hexdigest()
    return digest[:32]


def build_vehicle_session_subject(vin: str) -> Dict[str, Any]:
    session = VEHICLE_SOC_HISTORY[vin]
    values = session["values"]
    start = values[0]
    end = values[-1]

    envelope_id = f"env_{_hash_identifier(vin, start['timestamp'], end['timestamp'])}"
    session_id = f"sess_{_hash_identifier(vin, start['timestamp'])}"

    return {
        "type": "ChargingSessionEnvelope",
        "envelope_id": envelope_id,
        "envelope_version": ENVELOPE_VERSION,
        "schema_uri": SCHEMA_URI,
        "object_type": "ocpi_session",
        "last_updated": datetime.utcnow().isoformat() + "Z",
        "session_id": session_id,
        "start_ts": start["timestamp"],
        "end_ts": end["timestamp"],
        "vin": vin,
        "path": session["path"],
        "unit": session["unit"],
        "values": values,
    }


async def issue_vehicle_session_credential(denso: DensoDIDClient, vin: str) -> Dict[str, Any]:
    """
    Issues a ChargingSessionEnvelope credential for the specified VIN using static data.
    """
    subject = build_vehicle_session_subject(vin)
    return await denso.issue_credential(subject, credential_type="ChargingSessionEnvelope")


async def verify_vehicle_credentials(denso: DensoDIDClient, credential: Dict[str, Any]) -> Dict[str, Any]:
    """
    Pass-through helper for vehicle-side credential verification.
    """
    return await denso.verify_credential(credential)


async def verify_vehicle_presentation(denso: DensoDIDClient, presentation: Dict[str, Any]) -> Dict[str, Any]:
    """
    Pass-through helper for vehicle-side presentation verification (multiple credentials).
    """
    return await denso.verify_presentation(presentation)

