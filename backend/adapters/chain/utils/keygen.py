from solders.keypair import Keypair
import json

keypair_path = "id.json"

# Generate keypair
kp = Keypair()

# 64-byte secret key (same format solana-keygen stores)
secret_bytes = list(kp.to_bytes())

# Save to id.json
with open(keypair_path, "w") as f:
    json.dump(secret_bytes, f)

print("Saved keypair to:", keypair_path)
print("Public Key:", kp.pubkey())