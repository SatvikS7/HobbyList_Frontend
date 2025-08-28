import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_BACKEND_BASE;

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async(e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: "POST", 
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error(`Login failed: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Login successful:", data);
            alert("Login successful!");
        } catch (error) {
            console.error("Error logging in:", error);
            alert("Login failed. Please try again.");
        }
    };

    return (
        <div>
            <div className="signLog-container">
                <h1>Login</h1>
                <form onSubmit={handleLogin}>
                    <label>
                        Email:
                        <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} name="email" required />
                    </label>
                    <br />
                    <label>
                        Password:
                        <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} name="password" required />
                    </label>
                    <br />
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    )
}

export default LoginPage;