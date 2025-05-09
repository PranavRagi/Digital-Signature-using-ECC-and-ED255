import './App.css';
import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [message, setMessage] = useState("");
  const [eccSignature, setEccSignature] = useState("");
  const [eccR, setEccR] = useState("");
  const [eccS, setEccS] = useState("");
  const [ed25519Signature, setEd25519Signature] = useState("");
  const [verificationResult, setVerificationResult] = useState({ ECC: null, Ed25519: null });
  const [comparison, setComparison] = useState({
    security: "ECC (256-bit) ≈ Ed25519 (128-bit) security",
    performance: "Waiting for user input...",
    signatureSize: "Waiting for user input...",
  });

  const signMessage = async (algorithm) => {
    try {
      const startTime = performance.now();
      const response = await axios.post("http://127.0.0.1:5000/sign", { message, algorithm });
      const endTime = performance.now();
      const timeTaken = (endTime - startTime).toFixed(2);

      if (algorithm === "ECC") {
        setEccSignature(response.data.signature);
        setEccR(response.data.r);
        setEccS(response.data.s);
      } else {
        setEd25519Signature(response.data.signature);
      }

      updateComparison(algorithm, "sign", timeTaken, response.data.signature.length);
    } catch (error) {
      console.error("Signing Error:", error);
    }
  };

  const verifySignature = async (algorithm) => {
    try {
      const signature = algorithm === "ECC" ? eccSignature : ed25519Signature;
      const startTime = performance.now();
      const response = await axios.post("http://127.0.0.1:5000/verify", { message, signature, algorithm });
      const endTime = performance.now();
      const timeTaken = (endTime - startTime).toFixed(2);

      setVerificationResult((prev) => ({ ...prev, [algorithm]: response.data.verified }));
      updateComparison(algorithm, "verify", timeTaken, signature.length);
    } catch (error) {
      console.error("Verification Error:", error);
    }
  };

  const updateComparison = (algorithm, type, timeTaken, signatureSize) => {
    setComparison((prev) => {
      const updated = { ...prev };

      if (type === "sign") {
        updated.performance = `ECC Signing: ${algorithm === "ECC" ? timeTaken + " ms" : prev.performance.split(" | ")[0]} | Ed25519 Signing: ${algorithm === "Ed25519" ? timeTaken + " ms" : prev.performance.split(" | ")[1]}`;
      } else if (type === "verify") {
        updated.performance = `ECC Verification: ${algorithm === "ECC" ? timeTaken + " ms" : prev.performance.split(" | ")[0]} | Ed25519 Verification: ${algorithm === "Ed25519" ? timeTaken + " ms" : prev.performance.split(" | ")[1]}`;
      }

      updated.signatureSize = `ECC Signature: ${algorithm === "ECC" ? signatureSize + " bytes" : prev.signatureSize.split(" | ")[0]} | Ed25519 Signature: ${algorithm === "Ed25519" ? signatureSize + " bytes" : prev.signatureSize.split(" | ")[1]}`;

      return updated;
    });
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>ECC vs Ed25519 Digital Signature</h2>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter your message" style={{ width: "80%", height: "50px" }} />
      <br />
      <button onClick={() => signMessage("ECC")}>Sign with ECC</button>
      <button onClick={() => signMessage("Ed25519")}>Sign with Ed25519</button>

      <h3>Signatures</h3>
      <div style={{ display: "flex", justifyContent: "center", gap: "50px" }}>
        <div>
          <h4>ECC</h4>
          <textarea value={eccSignature} readOnly style={{ width: "300px", height: "60px" }} />
          <p><b>r:</b> {eccR}</p>
          <p><b>s:</b> {eccS}</p>
          <button onClick={() => verifySignature("ECC")}>Verify ECC</button>
          {verificationResult.ECC !== null && (
            <p>{verificationResult.ECC ? "✅ Signature been Verified" : "❌ Signature is Not Verified"}</p>
          )}
        </div>

        <div>
          <h4>Ed25519</h4>
          <textarea value={ed25519Signature} readOnly style={{ width: "300px", height: "60px" }} />
          <button onClick={() => verifySignature("Ed25519")}>Verify Ed25519</button>
          {verificationResult.Ed25519 !== null && (
            <p>{verificationResult.Ed25519 ? "✅ Signature been Verified" : "❌ Signature is Not Verified"}</p>
          )}
        </div>
      </div>

      <h3>Comparison</h3>
      <div>
        <p><b>Security:</b> {comparison.security}</p>
        <p><b>Performance:</b> {comparison.performance}</p>
        <p><b>Signature Size:</b> {comparison.signatureSize}</p>
      </div>
    </div>
  );
};

export default App;
