"use client";

import { useState, useEffect, FormEvent } from "react";
import { motion } from "framer-motion";
import VantaBackground from "./VantaBackground";

interface PasswordGateProps {
    children: React.ReactNode;
}

export default function PasswordGate({ children }: PasswordGateProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Check sessionStorage on mount (client-side only)
    useEffect(() => {
        const cached = sessionStorage.getItem("dashboard_auth");
        if (cached === "true") {
            setIsAuthenticated(true);
        }
        setCheckingSession(false);
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/dashboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (data.success) {
                setIsAuthenticated(true);
                sessionStorage.setItem("dashboard_auth", "true");
            } else {
                setError(data.message || "Incorrect password");
                setPassword("");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Show nothing while checking session to avoid hydration mismatch
    if (checkingSession) {
        return (
            <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <VantaBackground />
                <div className="relative z-10 animate-spin h-8 w-8 border-2 border-white/20 border-t-[#673ab7] rounded-full" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
            <VantaBackground />
            <motion.div
                className="relative z-10 w-full max-w-md"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 shadow-[0_0_40px_rgba(103,58,183,0.2)] p-8 sm:p-10">
                    {/* Lock Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                            <svg
                                className="w-10 h-10 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                                />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-white text-center mb-2">
                        Dashboard Access
                    </h1>
                    <p className="text-gray-400 text-sm text-center mb-8">
                        Enter the admin password to continue
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                autoFocus
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#673ab7]/50 focus:border-[#673ab7]/50 transition-all"
                            />
                        </div>

                        {error && (
                            <motion.p
                                className="text-red-400 text-sm text-center"
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !password}
                            className="unlock-btn w-full py-3 rounded-lg bg-transparent text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    <span>Verifying...</span>
                                </span>
                            ) : (
                                <span>Unlock Dashboard</span>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-gray-500 text-xs text-center mt-6">
                    Protected area · DevCatalyst Admin
                </p>
            </motion.div>
        </div>
    );
}
