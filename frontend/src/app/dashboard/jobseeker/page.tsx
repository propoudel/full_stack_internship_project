"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../../lib/axios";

export default function JobSeekerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get("/auth/me");
        setUser(userRes.data.data);

        const appsRes = await api.get("/applications/me");
        setApplications(appsRes.data.data);

        const savedRes = await api.get("/saved-jobs");
        setSavedCount(savedRes.data.data.length);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading || !user) return null;

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "Pending").length,
    reviewed: applications.filter((a) => a.status === "Reviewed").length,
    accepted: applications.filter((a) => a.status === "Accepted").length,
    rejected: applications.filter((a) => a.status === "Rejected").length,
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.name} 👋</h1>
        <p className="mt-1 text-gray-500">Here's an overview of your job search</p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <StatCard label="Applications" value={stats.total} color="sky" />
          <StatCard label="Pending" value={stats.pending} color="amber" />
          <StatCard label="Reviewed" value={stats.reviewed} color="sky" />
          <StatCard label="Accepted" value={stats.accepted} color="emerald" />
          <StatCard label="Saved Jobs" value={savedCount} color="amber" />
        </div>

        <div className="mt-8 flex gap-3">
          <Link href="/jobs" className="rounded bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600">
            Browse Jobs
          </Link>
          <Link href="/applications/me" className="rounded bg-sky-100 px-4 py-2 text-sky-700 hover:bg-sky-200">
            View My Applications
          </Link>
          <Link href="/saved-jobs" className="rounded bg-sky-100 px-4 py-2 text-sky-700 hover:bg-sky-200">
            View Saved Jobs
          </Link>
        </div>
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