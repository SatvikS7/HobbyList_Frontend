import { useEffect, useState } from "react";
import { Navigate, useNavigate } from 'react-router-dom';


const API_BASE = import.meta.env.VITE_BACKEND_BASE;

function SignupPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignup = async(e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE}/auth/signup`, {
                method: "POST", 
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error(`Signup failed: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Signup successful:", data);
            alert("Account created successfully!");
            navigate('/login');
        } catch (error) {
            console.error("Error signing up:", error);
            alert("Signup failed. Please try again.");
        }
    };

    return (
        <div>
            <div className="signLog-container">
                <h1>Sign Up</h1>
                <form onSubmit={handleSignup}>
                    <label>
                        Email:
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} name="email" required />
                        </label>
                    <br />
                    <label>
                        Password:
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} name="password" required />
                    </label>
                    <br />
                    <button type="submit">Sign Up</button>
                </form>
            </div>
        </div>
    )
}

export default SignupPage;
