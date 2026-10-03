"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/axios";

export default function EditCompanyPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<number | null>(null);
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get("/companies/me/company");
        const company = res.data.data;
        setCompanyId(company.id);
        setFormData({
          name: company.name,
          description: company.description,
          logo: company.logo,
          website: company.website,
          email: company.email,
          phone: company.phone,
          address: company.address,
          industry: company.industry,
          companySize: company.companySize,
        });
      } catch (err) {
        router.push("/company/me");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await api.put(`/companies/${companyId}`, formData);
      router.push("/company/me");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-emerald-50 p-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg space-y-4 rounded-lg bg-white p-8 shadow-md"
      >
        <h1 className="text-2xl font-bold text-gray-800">Edit Company</h1>

        {error && (
          <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>
        )}

        <input name="name" placeholder="Company Name" value={formData.name} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400" />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required rows={3} className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400" />
        <input name="logo" placeholder="Logo URL" value={formData.logo} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400" />
        <input name="website" placeholder="Website URL" value={formData.website} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400" />
        <input name="email" type="email" placeholder="Company Email" value={formData.email} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400" />
        <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400" />
        <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400" />
        <input name="industry" placeholder="Industry" value={formData.industry} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400" />
        <input name="companySize" placeholder="Company Size" value={formData.companySize} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400" />

        <button type="submit" disabled={saving} className="w-full rounded bg-emerald-500 p-2 font-medium text-white hover:bg-emerald-600 disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </main>
  );
}