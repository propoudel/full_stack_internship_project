"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/axios";

export default function CreateCompanyPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        logo: "",
        website: "",
        email: "",
        phone: "",
        address: "",
        industry: "",
        companySize: "",
    });

    const [error, setError] = useState("");
    const [warning, setWarning] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setWarning("");
        setLoading(true);

        try {
            const res = await api.post("/companies", formData);

            if (res.data.warning) {
                setWarning(res.data.warning);
                // Give them a moment to read the warning before redirecting
                setTimeout(() => router.push("/company/me"), 3000);
            } else {
                router.push("/company/me");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-emerald-50 p-8">
            <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4 rounded-lg bg-white p-8 shadow-md">
                <h1 className="text-2xl font-bold text-gray-800">Create Your Company</h1>

                {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
                {warning && <p className="rounded bg-amber-50 p-2 text-sm text-amber-600">⚠️ {warning}</p>}


                <input name="name" placeholder="Company Name" value={formData.name} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400"/>
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required rows={3} className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400"/>
                <input name="logo" placeholder="Logo URL" value={formData.logo} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400"/>
                <input name="website" placeholder="Website URL" value={formData.website} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400"/>
                <input name="email" type="email" placeholder="Company Email" value={formData.email} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400"/>
                <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400"/>
                <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400"/>
                <input name="industry" placeholder="Industry" value={formData.industry} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400"/>
                <input name="companySize" placeholder="Company Size (e.g. 50-100)" value={formData.companySize} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400"/>
                <button type="submit" disabled={loading} className="w-full rounded bg-blue-600 p-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                    {loading ? "Creating..." : "Create Company"}
                </button>
            </form>
        </main>
    );
}