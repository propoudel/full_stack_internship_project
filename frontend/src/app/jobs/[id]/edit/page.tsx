"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../../lib/axios";

export default function EditJobPage() {
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    employmentType: "FullTime",
    experienceLevel: "",
    salaryMin: "",
    salaryMax: "",
    deadline: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        const job = res.data.data;
        setFormData({
          title: job.title,
          description: job.description,
          requirements: job.requirements,
          location: job.location,
          employmentType: job.employmentType,
          experienceLevel: job.experienceLevel,
          salaryMin: String(job.salaryMin),
          salaryMax: String(job.salaryMax),
          deadline: job.deadline.split("T")[0], // format for <input type="date">
        });
      } catch (err) {
        router.push("/jobs/me");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await api.put(`/jobs/${id}`, {
        ...formData,
        salaryMin: Number(formData.salaryMin),
        salaryMax: Number(formData.salaryMax),
      });
      router.push("/jobs/me");
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
        <h1 className="text-2xl font-bold text-gray-800">Edit Job</h1>

        {error && (
          <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>
        )}

        <input name="title" placeholder="Job Title" value={formData.title} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400" />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required rows={3} className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400" />
        <textarea name="requirements" placeholder="Requirements" value={formData.requirements} onChange={handleChange} required rows={3} className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400" />
        <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400" />

        <select name="employmentType" value={formData.employmentType} onChange={handleChange} className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400">
          <option value="FullTime">Full Time</option>
          <option value="PartTime">Part Time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
          <option value="Remote">Remote</option>
        </select>

        <input name="experienceLevel" placeholder="Experience Level" value={formData.experienceLevel} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400" />

        <div className="flex gap-3">
          <input name="salaryMin" type="number" placeholder="Min Salary" value={formData.salaryMin} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400" />
          <input name="salaryMax" type="number" placeholder="Max Salary" value={formData.salaryMax} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400" />
        </div>

        <input name="deadline" type="date" value={formData.deadline} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400" />

        <button type="submit" disabled={saving} className="w-full rounded bg-emerald-500 p-2 font-medium text-white hover:bg-emerald-600 disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </main>
  );
}