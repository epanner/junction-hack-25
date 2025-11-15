from typing import Any, Dict

from adapters.denso_did import DensoDIDClient

CONSENT_SUBJECT = {
    "type": "UserChargingConsent",
    "driverDid": "did:itn:driver:abc123",
    "vehicleVin": "W1KAH5EB2PF093797",
    "allowedChargerIds": ["did:itn:charger:fleet-01"],
    "maxPriceEurPerKwh": 0.45,
    "expiresAt": "2025-12-31T23:59:59Z",
}


async def issue_user_consent_credential(denso: DensoDIDClient) -> Dict[str, Any]:
    """
    Issues a sample consent credential for the mobile wallet.
    """
    return await denso.issue_credential(
        credential_subject=CONSENT_SUBJECT,
        credential_type="UserChargingConsent",
    )


async def verify_user_credential(denso: DensoDIDClient, credential: Dict[str, Any]) -> Dict[str, Any]:
    return await denso.verify_credential(credential)


async def verify_user_presentation(denso: DensoDIDClient, presentation: Dict[str, Any]) -> Dict[str, Any]:
    return await denso.verify_presentation(presentation)

