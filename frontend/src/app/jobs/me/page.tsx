"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../../../lib/axios";

export default function MyJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs/me/jobs");
      setJobs(res.data.data);
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAction = async (jobId: number, action: "publish" | "deactivate" | "reopen") => {
    try {
      await api.patch(`/jobs/${jobId}/${action}`);
      fetchJobs(); // refresh the list after any status change
    } catch (err: any) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (jobId: number) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      fetchJobs();
    } catch (err: any) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  if (loading) return null;

  const statusColors: Record<string, string> = {
    Draft: "bg-amber-100 text-amber-700",
    Open: "bg-emerald-100 text-emerald-700",
    Closed: "bg-gray-200 text-gray-600",
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">My Jobs</h1>
          <Link href="/jobs/create" className="rounded bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600">
            Post a Job
          </Link>
        </div>

        {jobs.length === 0 && (
          <p className="text-gray-500">You haven't posted any jobs yet.</p>
        )}

        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="rounded-lg bg-white p-6 shadow-md">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">{job.title}</h2>
                <span className={`rounded px-2 py-1 text-xs font-medium ${statusColors[job.status]}`}>
                  {job.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">{job.location} · {job.employmentType}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.status === "Draft" && (
                  <button onClick={() => handleAction(job.id, "publish")} className="rounded bg-emerald-500 px-3 py-1 text-sm text-white hover:bg-emerald-600">
                    Publish
                  </button>
                )}
                {job.status === "Open" && (
                  <button onClick={() => handleAction(job.id, "deactivate")} className="rounded bg-amber-500 px-3 py-1 text-sm text-white hover:bg-amber-600">
                    Deactivate
                  </button>
                )}
                {job.status === "Closed" && (
                  <button onClick={() => handleAction(job.id, "reopen")} className="rounded bg-sky-500 px-3 py-1 text-sm text-white hover:bg-sky-600">
                    Reopen
                  </button>
                )}
                <Link href={`/jobs/${job.id}/edit`} className="rounded bg-sky-100 px-3 py-1 text-sm text-sky-700 hover:bg-sky-200">
                  Edit
                </Link>
                <Link href={`/jobs/${job.id}/applicants`} className="rounded bg-sky-100 px-3 py-1 text-sm text-sky-700 hover:bg-sky-200">
                  View Applicants
                </Link>
                <button onClick={() => handleDelete(job.id)} className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}