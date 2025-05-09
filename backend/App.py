from flask import Flask, request, jsonify
from flask_cors import CORS
from cryptography.hazmat.primitives.asymmetric import ec, ed25519
from cryptography.hazmat.primitives import hashes
import base64

app = Flask(__name__)
CORS(app)

# Generate ECC key
ecc_private_key = ec.generate_private_key(ec.SECP256R1())
ecc_public_key = ecc_private_key.public_key()

# Generate Ed25519 key
ed25519_private_key = ed25519.Ed25519PrivateKey.generate()
ed25519_public_key = ed25519_private_key.public_key()

@app.route('/sign', methods=['POST'])
def sign():
    try:
        data = request.json
        message = data.get("message", "").encode()

        algo = data.get("algorithm")
        if algo == "ECC":
            signature = ecc_private_key.sign(message, ec.ECDSA(hashes.SHA256()))
            r, s = extract_r_s(signature)
            return jsonify({
                "signature": base64.b64encode(signature).decode(),
                "r": r,
                "s": s
            })
        elif algo == "Ed25519":
            signature = ed25519_private_key.sign(message)
            return jsonify({
                "signature": base64.b64encode(signature).decode()
            })
        else:
            return jsonify({"error": "Invalid algorithm"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/verify', methods=['POST'])
def verify():
    try:
        data = request.json
        message = data.get("message", "").encode()
        signature = base64.b64decode(data.get("signature", ""))
        algo = data.get("algorithm")

        if algo == "ECC":
            try:
                ecc_public_key.verify(signature, message, ec.ECDSA(hashes.SHA256()))
                return jsonify({"verified": True})
            except:
                return jsonify({"verified": False})
        elif algo == "Ed25519":
            try:
                ed25519_public_key.verify(signature, message)
                return jsonify({"verified": True})
            except:
                return jsonify({"verified": False})
        else:
            return jsonify({"error": "Invalid algorithm"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def extract_r_s(signature):
    r, s = signature[:len(signature)//2], signature[len(signature)//2:]
    return base64.b64encode(r).decode(), base64.b64encode(s).decode()

if __name__ == '__main__':
    app.run(debug=True)
