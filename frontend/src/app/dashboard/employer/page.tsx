"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../../lib/axios";

export default function EmployerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [totalApplicants, setTotalApplicants] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get("/auth/me");
        setUser(userRes.data.data);

        try {
          const companyRes = await api.get("/companies/me/company");
          setCompany(companyRes.data.data);

          const jobsRes = await api.get("/jobs/me/jobs");
          const jobList = jobsRes.data.data;
          setJobs(jobList);

          // Sum applicants across all jobs
          const counts = await Promise.all(
            jobList.map((job: any) =>
              api.get(`/jobs/${job.id}/applications`).then((r) => r.data.data.length)
            )
          );
          setTotalApplicants(counts.reduce((sum, c) => sum + c, 0));
        } catch {
          setCompany(null);
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading || !user) return null;

  const jobStats = {
    total: jobs.length,
    draft: jobs.filter((j) => j.status === "Draft").length,
    open: jobs.filter((j) => j.status === "Open").length,
    closed: jobs.filter((j) => j.status === "Closed").length,
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.name} 👋</h1>

        {!company ? (
          <div className="mt-8 rounded-lg bg-white p-6 text-center shadow-md">
            <p className="text-gray-600">You haven't created a company yet.</p>
            <Link href="/company/create" className="mt-3 inline-block rounded bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600">
              Create Your Company
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-1 text-gray-500">{company.name} · {company.industry}</p>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
              <StatCard label="Jobs Posted" value={jobStats.total} color="sky" />
              <StatCard label="Draft" value={jobStats.draft} color="amber" />
              <StatCard label="Open" value={jobStats.open} color="emerald" />
              <StatCard label="Closed" value={jobStats.closed} color="sky" />
              <StatCard label="Total Applicants" value={totalApplicants} color="amber" />
            </div>

            <div className="mt-8 flex gap-3">
              <Link href="/jobs/create" className="rounded bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600">
                Post a Job
              </Link>
              <Link href="/jobs/me" className="rounded bg-sky-100 px-4 py-2 text-sky-700 hover:bg-sky-200">
                Manage Jobs
              </Link>
              <Link href="/company/me" className="rounded bg-sky-100 px-4 py-2 text-sky-700 hover:bg-sky-200">
                View Company Profile
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    sky: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className={`rounded-lg p-4 text-center shadow-sm ${colorMap[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}