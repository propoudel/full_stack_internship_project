"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/axios";
import Link from "next/dist/client/link";

export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.post("/auth/register", formData);
            const { user, token } = res.data.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            // redirect aftersucesfully registeration
            router.push("/dashboard");
        } catch (error: any) {
            const message = error.response?.data?.message || "Something went wrong";
            setError(message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-950">
            <form onSubmit={handleSubmit}
                className="w-full max-w-md space-y-4 rounded-lg bg-gray-900 p-8">
                <h1 className="text-2xl font-bold text-white">Create an account</h1>

                {error && (
                    <p className="rounded bg-red-500/10 p-2 text-sm text-red-400">
                        {error}
                    </p>
                )}

                <input
                    type="text"
                    name="name"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded bg-gray-800 p-2 text-white outline-none"
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded bg-gray-800 p-2 text-white outline-none"
                />

                <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full rounded bg-gray-800 p-2 text-white outline-none"
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded bg-gray-800 p-2 text-white outline-none"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-blue-600 p-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Creating account..." : "Register"}
                </button>
                <p className="text-center text-sm text-gray-400">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-500 hover:underline">
                        Login
                    </Link>
                </p>
            </form>
        </main>
    );
}

