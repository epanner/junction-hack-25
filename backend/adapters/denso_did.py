from typing import Optional, Dict, Any
import httpx
from config import settings

class DensoDIDClient:
    """
    Adapter for communicating with the Denso DID Gateway.
    """
    
    def __init__(self, base_url: str, api_key: Optional[str] = None, timeout: float = 10.0):
        self.base_url = base_url
        self.api_key = api_key
        self.client = httpx.AsyncClient(base_url=base_url, timeout=timeout)

    def _headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["X-API-Key"] = self.api_key
        return headers

    async def close(self):
        await self.client.aclose()

    # -------------------------
    # Public API wrappers
    # -------------------------

    async def verify_credential(self, credential: Dict[str, Any]) -> Dict[str, Any]:
        """
        Wraps POST /api/verify-credential
        """
        resp = await self.client.post(
            "/api/verify-credential",
            json=credential,
            headers=self._headers(),
        )
        return self._handle_response(resp)

    async def verify_presentation(self, presentation: Dict[str, Any]) -> Dict[str, Any]:
        """
        Wraps POST /api/verify-presentation
        """
        resp = await self.client.post(
            "/api/verify-presentation",
            json=presentation,
            headers=self._headers(),
        )
        return self._handle_response(resp)

    async def issue_credential(self, credential_subject: Dict[str, Any], credential_type: str) -> Dict[str, Any]:
        """
        Wraps POST /api/issue-credential
        """
        payload = {"credentialSubject": credential_subject}
        resp = await self.client.post(
            "/api/issue-credential",
            params={"credential_type": credential_type},
            json=payload,
            headers=self._headers(),
        )
        return self._handle_response(resp)

    async def update_credential(self, vc_uuid: str, credential_subject: Dict[str, Any]) -> Dict[str, Any]:
        """
        Wraps POST /api/update-credential.
        Revokes the previous VC identified by vc_uuid and issues a new one with the supplied subject.
        """
        payload = {"credentialSubject": credential_subject}
        resp = await self.client.post(
            "/api/update-credential",
            params={"vc_uuid": vc_uuid},
            json=payload,
            headers=self._headers(),
        )
        return self._handle_response(resp)

    async def request_presentation(self, credentials: Any) -> Dict[str, Any]:
        """
        Wraps POST /api/request-presentation.
        Builds a verifiable presentation from an array of credentials payloads.
        """
        resp = await self.client.post(
            "/api/request-presentation",
            json=credentials,
            headers=self._headers(),
        )
        return self._handle_response(resp)

    # -------------------------
    # Internal helpers
    # -------------------------

    def _handle_response(self, resp: httpx.Response) -> Dict[str, Any]:
        """
        Unified error handling for all Denso DID Gateway responses.
        """
        try:
            data = resp.json()
        except Exception:
            data = {"message": resp.text}

        if resp.status_code != 200:
            raise DensoDIDError(resp.status_code, data)

        return data


class DensoDIDError(Exception):
    """
    Raised when the Denso DID Gateway returns a non-200 response.
    """

    def __init__(self, status_code: int, detail: Any):
        super().__init__(f"Denso DID Gateway error {status_code}: {detail}")
        self.status_code = status_code
        self.detail = detail