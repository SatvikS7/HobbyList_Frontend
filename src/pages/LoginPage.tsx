import { useEffect, useState } from "react";
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";


const API_BASE = import.meta.env.VITE_BACKEND_BASE;

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
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
            sessionStorage.setItem("jwt", data.token);
            login(data.token);
            alert("Login successful!");
            if(data.newAccount) {
                navigate('/onboarding-page')
            } else {
                navigate('/home-page')
            }
        } catch (error) {
            console.error("Error logging in:", error);
            alert("Login failed. Please try again.");
        }
    };

    return (
    <div className="h-screen flex justify-center items-center bg-white">
        <div className="flex flex-col items-center justify-center border-2 border-black rounded-[5%] bg-gradient-to-br from-[#fadd9e] to-[#daba76] p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-[#000000] mb-6">Login</h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
            <label className="flex flex-col text-black font-medium">
            Email:
            <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
                required
                className="mt-1 p-2 border border-white rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#b99547]"
            />
            </label>

            <label className="flex flex-col text-black font-medium">
            Password:
            <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="password"
                required
                className="mt-1 p-2 border border-white rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#b99547]"
            />
            </label>

            <button
            type="submit"
            className="mt-4 px-4 py-2 rounded-lg bg-[#c77903] text-white font-semibold hover:bg-[#b36b02] transition-colors duration-200"
            >
            Login
            </button>
        </form>
        </div>
    </div>
    )

}

export default LoginPage;