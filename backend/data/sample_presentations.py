from data.sample_credentials import BATTERY_SOH_VC, CHARGING_SESSION_VC

SAMPLE_TRI_PARTY_PRESENTATION = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://w3id.org/security/suites/ed25519-2020/v1",
    ],
    "type": ["VerifiablePresentation"],
    "verifiableCredential": [
        CHARGING_SESSION_VC,
        BATTERY_SOH_VC,
    ],
    "id": "urn:uuid:8432b0d4-17bc-4668-875b-586cf18e431b",
    "holder": "did:itn:EZCE8tY6nXCa48odCZakbj",
    "proof": {
        "type": "Ed25519Signature2020",
        "created": "2025-11-06T04:51:45Z",
        "verificationMethod": "did:itn:EZCE8tY6nXCa48odCZakbj#z6MkrpFc8LsQ26DwaxGM3BNzQwHELcxtNvoggMT4kcpmY88s",
        "proofPurpose": "authentication",
        "challenge": "e62358d3-5a30-42e6-8b87-278b3b04f4a5",
        "proofValue": "z4m3veaKfxx1F2auiyzKApTWazYcxuGaZ2JKeKyT3bQ5cuGuLZaBah9xgE7cSbmmfxhSmK5EFKJzsyM6NBcALpyAz",
    },
}

