import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_BACKEND_BASE

function VerificationPage() {
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("Invalid verification link");
      return;
    }

    fetch(`${API_BASE}/auth/verify?token=${token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Verification failed");
        }
        return res.json();
      })
      .then(() => {
        setStatus("Email verified successfully! You can now log in.");
      })
      .catch(() => {
        setStatus("Verification failed. Link may be invalid or expired.");
      });
  }, []);

  return (
    <div>
      <div>
        <h1 className="status-text">Email Verification</h1>
        <p className="status-text">{status}</p>
      </div>
    </div>
  );
}

export default VerificationPage;
