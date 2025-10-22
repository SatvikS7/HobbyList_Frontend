import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigate, useNavigate } from 'react-router-dom';


const API_BASE = import.meta.env.VITE_BACKEND_BASE;

const Onboarding: React.FC = () => {
    const token = sessionStorage.getItem("jwt");
    const [step, setStep] = useState<"username" | "hobbies">("username");
    const [username, setUsername] = useState("");
    const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
    const hobbies = Array.from({ length: 10 }, (_, i) => `dummy${i + 1}`);
    const navigate = useNavigate();



    // Shared animation variants
    const slideVariants = {
        enter: { x: "100%", opacity: 0 },
        center: { x: 0, opacity: 1 },
        exit: { x: "-100%", opacity: 0 },
    };

    const handleUsernameSubmit = async () => {
        if (!username.trim()) return alert("Please enter a username.");

        try {
            const res = await fetch(`${API_BASE}/profile/update-profile`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ username: username.trim() }),
            });
            if (!res.ok) throw new Error("Failed to update username");
            setStep("hobbies");
        } catch (err) {
            console.error("Error updating username:", err);
            alert("Failed to update username.");
        }
    };

    const toggleHobby = (hobby: string) => {
        setSelectedHobbies((prev) =>
            prev.includes(hobby)
            ? prev.filter((h) => h !== hobby)
            : [...prev, hobby]
        );
    };

    const handleHobbySubmit = async () => {
        try {
            const res = await fetch(`${API_BASE}/profile/update-profile`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ hobbies: selectedHobbies }),
            });
            if (!res.ok) throw new Error("Failed to update hobbies");

            alert("Onboarding complete!");
            navigate('/home-page');
        } catch (err) {
            console.error("Error updating hobbies:", err);
            alert("Failed to update hobbies.");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-md bg-white">
            <AnimatePresence mode="wait">
                {step === "username" && (
                <motion.div
                    key="username"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.5 }}
                    className="p-6 flex flex-col items-center"
                >
                    <h2 className="text-2xl font-semibold mb-4">
                    Welcome! Choose your username
                    </h2>
                    <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter desired username"
                    className="border p-2 rounded w-full mb-4"
                    />
                    <button
                    onClick={handleUsernameSubmit}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                    Continue
                    </button>
                </motion.div>
                )}

                {step === "hobbies" && (
                <motion.div
                    key="hobbies"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.5 }}
                    className="p-6 flex flex-col items-center"
                >
                    <h2 className="text-2xl font-semibold mb-4">
                    Select your hobbies
                    </h2>

                    <div className="grid grid-cols-2 gap-3 mb-6 w-full">
                    {hobbies.map((hobby) => (
                        <button
                        key={hobby}
                        onClick={() => toggleHobby(hobby)}
                        className={`p-2 rounded border transition-colors ${
                            selectedHobbies.includes(hobby)
                            ? "bg-blue-500 text-white border-blue-600"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                        >
                        {hobby}
                        </button>
                    ))}
                    </div>

                    <button
                    onClick={handleHobbySubmit}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                    >
                    Finish
                    </button>
                </motion.div>
                )}
            </AnimatePresence>
            </div>
        </div>
    );
};

export default Onboarding;
