import { useEffect, useState } from "react";
import { Navigate, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_BACKEND_BASE;

function PasswordResetForm() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handlePasswordReset = async(e: React.FormEvent) => {
        e.preventDefault();

        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            console.log(confirmPassword)
            const response = await fetch(`${API_BASE}/auth/reset-password?token=${token}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password }),
            });

            if (!response.ok) {
                throw new Error("Failed to reset password");
            }

            alert("Password reset successfully!");
        } catch (error) {
            console.error("Error resetting password:", error);
            alert("Password reset failed. Please try again.");
        }
    }

    return (
        <div>
            <h1>Password Reset</h1>
            <form onSubmit={handlePasswordReset}>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your new password"
                    required
                />
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    required
                />
                <button type="submit">Reset Password</button>
            </form>
        </div>
    );
}


export default PasswordResetForm;