from typing import Any, Dict

from adapters.denso_did import DensoDIDClient, DensoDIDError
from data.sample_credentials import CHARGING_SESSION_VC
from data.sample_presentations import SAMPLE_TRI_PARTY_PRESENTATION


class DensoDIDVerificationService:
    """
    Thin wrapper around Denso DID Gateway operations so routers only
    depend on a single verifier instead of juggling raw HTTP calls.
    """

    def __init__(self, client: DensoDIDClient):
        self.client = client

    async def verify_charging_session_vc(self) -> Dict[str, Any]:
        """
        Ensures the provided charging-session credential is valid.
        """
        return await self.client.verify_credential(CHARGING_SESSION_VC)

    async def verify_tri_party_presentation(self) -> Dict[str, Any]:
        """
        Validates a bundled presentation containing vehicle + battery proofs.
        """
        return await self.client.verify_presentation(SAMPLE_TRI_PARTY_PRESENTATION)

    async def verify_all(self) -> Dict[str, Any]:
        """
        Runs both VC and VP checks so the caller gets granular statuses.
        """
        try:
            credential_result = await self.verify_charging_session_vc()
            presentation_result = await self.verify_tri_party_presentation()
        except DensoDIDError as exc:
            return {
                "verified": False,
                "error": {
                    "status_code": exc.status_code,
                    "detail": exc.detail,
                },
            }

        aggregate_verified = (
            credential_result.get("verified") and presentation_result.get("presentationResult", {}).get("verified")
        )

        return {
            "verified": bool(aggregate_verified),
            "credentialResult": credential_result,
            "presentationResult": presentation_result,
        }

