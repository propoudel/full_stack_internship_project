"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../lib/axios";

export default function JobDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [savingJob, setSavingJob] = useState(false);

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const [experience, setExperience] = useState("");
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data.data);

        //Checking if the job is already saved
        try{
          const savedRes = await api.get(`/saved-jobs`);
          const saved = savedRes.data.data.some((savedJob: any) => savedJob.jobId === Number(id));
          setIsSaved(saved);
        }catch{
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleToggleSave = async () => {
  setSavingJob(true);
  try {
    if (isSaved) {
      await api.delete(`/jobs/${id}/save`);
      setIsSaved(false);
    } else {
      await api.post(`/jobs/${id}/save`);
      setIsSaved(true);
    }
  } catch (err: any) {
    if (err.response?.status === 401) {
      router.push("/login");
      return;
    }
    alert(err.response?.data?.message || "Something went wrong");
  } finally {
    setSavingJob(false);
  }
};

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError("");
    setApplying(true);

    try {
      await api.post(`/jobs/${id}/applications`, { resumeUrl, experience });
      setApplySuccess("Application submitted successfully!");
      setShowApplyForm(false);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/login");
        return;
      }
      setApplyError(err.response?.data?.message || "Something went wrong");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return null;
  if (!job) return <p className="p-8 text-gray-500">Job not found.</p>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 p-8">
      <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">{job.title}</h1>
        <p className="mt-1 text-gray-500">
          {job.location} · {job.employmentType} · {job.experienceLevel}
        </p>
        <p className="mt-2 text-emerald-600">
          NPR {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Deadline: {new Date(job.deadline).toLocaleDateString()}
        </p>

        <div className="mt-6">
          <h2 className="font-semibold text-gray-800">Description</h2>
          <p className="mt-1 text-gray-600">{job.description}</p>
        </div>

        <div className="mt-4">
          <h2 className="font-semibold text-gray-800">Requirements</h2>
          <p className="mt-1 text-gray-600">{job.requirements}</p>
        </div>

        {applySuccess && (
          <p className="mt-6 rounded bg-emerald-50 p-3 text-emerald-700">{applySuccess}</p>
        )}

        {!applySuccess && !showApplyForm && (
          <button
            onClick={() => setShowApplyForm(true)}
            className="mt-6 rounded bg-emerald-500 px-5 py-2 text-white hover:bg-emerald-600"
          >
            Apply Now
          </button>
        )}
        <button
    onClick={handleToggleSave}
    disabled={savingJob}
    className={`rounded px-5 py-2 font-medium transition disabled:opacity-50 ${
      isSaved
        ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
        : "bg-sky-100 text-sky-700 hover:bg-sky-200"
    }`}
  >
    {isSaved ? "★ Saved" : "☆ Save Job"}
  </button>

        {showApplyForm && (
          <form onSubmit={handleApply} className="mt-6 space-y-3 rounded-lg bg-sky-50 p-4">
            <h3 className="font-semibold text-gray-800">Submit Your Application</h3>

            {applyError && (
              <p className="rounded bg-red-50 p-2 text-sm text-red-600">{applyError}</p>
            )}

            <input
              type="url"
              placeholder="Resume URL (link to your resume)"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              required
              className="w-full rounded border border-sky-200 bg-white p-2 text-gray-800 outline-none focus:border-emerald-400"
            />
            <textarea
              placeholder="Relevant experience (optional)"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows={3}
              className="w-full rounded border border-sky-200 bg-white p-2 text-gray-800 outline-none focus:border-emerald-400"
            />

            <button
              type="submit"
              disabled={applying}
              className="rounded bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {applying ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}