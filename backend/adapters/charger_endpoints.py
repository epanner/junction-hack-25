from typing import Any, Dict

from adapters.denso_did import DensoDIDClient

CHARGER_CAPABILITY_SUBJECT = {
    "type": "ChargerCapability",
    "chargerId": "did:itn:charger:fleet-01",
    "location": "Helsinki, FI",
    "maxPowerKw": 150,
    "connectorTypes": ["CCS2", "CHAdeMO"],
    "tariffEurPerKwh": 0.32,
    "operator": "GridPass Demo Ops",
}


async def issue_charger_capability_credential(denso: DensoDIDClient) -> Dict[str, Any]:
    return await denso.issue_credential(
        credential_subject=CHARGER_CAPABILITY_SUBJECT,
        credential_type="ChargerCapability",
    )


async def verify_charger_credential(denso: DensoDIDClient, credential: Dict[str, Any]) -> Dict[str, Any]:
    return await denso.verify_credential(credential)


async def verify_charger_presentation(denso: DensoDIDClient, presentation: Dict[str, Any]) -> Dict[str, Any]:
    return await denso.verify_presentation(presentation)

