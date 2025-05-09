import nacl.signing
import nacl.encoding

# Generate Ed25519 Key Pair
def generate_keys():
    private_key = nacl.signing.SigningKey.generate()
    public_key = private_key.verify_key
    return private_key.encode(encoder=nacl.encoding.HexEncoder), public_key.encode(encoder=nacl.encoding.HexEncoder)

# Sign Message
def sign_message(private_key_hex, message):
    private_key = nacl.signing.SigningKey(private_key_hex, encoder=nacl.encoding.HexEncoder)
    signed_message = private_key.sign(message.encode(), encoder=nacl.encoding.HexEncoder)
    return signed_message.signature.decode()

# Verify Signature
def verify_signature(public_key_hex, message, signature_hex):
    public_key = nacl.signing.VerifyKey(public_key_hex, encoder=nacl.encoding.HexEncoder)
    try:
        public_key.verify(message.encode(), bytes.fromhex(signature_hex))
        return True
    except:
        return False
