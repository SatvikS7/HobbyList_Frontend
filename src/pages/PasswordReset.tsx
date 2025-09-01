import { useEffect, useState } from "react";
import { Navigate, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_BACKEND_BASE;

function PasswordReset() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("");
    const navigate = useNavigate();

    const handleEmailSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE}/auth/request-password-reset`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error("Failed to send password reset email");
            }

            const data = await response.json();
            setStatus("Password reset email sent successfully!");
            setTimeout(() => {
                navigate("/password-reset");
            }, 3000);
        } catch (error) {
            console.error("Error sending password reset email:", error);
            alert("Password reset email failed. Please try again.");
        }
    };

    return (
        <div>
            <h1>Email</h1>
            <form onSubmit={handleEmailSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                />
                <button type="submit">Send Password Reset Email</button>
            </form>
            {status && <p className="status-text">{status}</p>}
        </div>
        
    );
}

export default PasswordReset;

         