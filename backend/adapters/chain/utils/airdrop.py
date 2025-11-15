import json
import requests
from solders.keypair import Keypair

KEYPAIR_PATH = "id.json"

with open(KEYPAIR_PATH, "r") as f:
    secret = bytes(json.load(f))

kp = Keypair.from_bytes(secret)
pubkey_str = str(kp.pubkey())

lamports = int(0.1 * 1_000_000_000)  # 0.1 SOL

payload = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "requestAirdrop",
    "params": [pubkey_str, lamports],
}

resp = requests.post("https://api.devnet.solana.com", json=payload, timeout=30)
print("HTTP status:", resp.status_code)
print("Response JSON:", json.dumps(resp.json(), indent=2))
