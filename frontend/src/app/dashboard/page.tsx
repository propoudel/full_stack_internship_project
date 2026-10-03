"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/axios";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs,setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboarData = async () => {
      try {
        const UserRes = await api.get("/auth/me");
        const currentUser = UserRes.data.data;
        setUser(currentUser);

        //Fetch applications
        const appsRes = await api.get("/applications/me");
        setApplications(appsRes.data.data);

        // Fetch owned jobs
        try{
          const jobsRes = await api.get("/jobs/me/jobs");
          setJobs(jobsRes.data.data);
        }catch(err){
          setJobs([]);
        }
      } catch (err) {
        router.push("/login"); // not logged in / invalid cookie
      } finally {
        setLoading(false);
      }
    };
    fetchDashboarData();
  }, [router]);

  if (loading) return null;
  if(!user) return null;

  const applicationsStats ={
    total:applications.length,
    pending:applications.filter((a) => a.status === "Pending").length,
    reviewed:applications.filter((a) => a.status === "Reviewed").length,
    accepted:applications.filter((a) => a.status === "Accepted").length,
    rejected:applications.filter((a) => a.status === "Rejected").length,
  };

   const jobStats = {
    total: jobs.length,
    draft: jobs.filter((j) => j.status === "Draft").length,
    open: jobs.filter((j) => j.status === "Open").length,
    closed: jobs.filter((j) => j.status === "Closed").length,
  };


 return (
  <main className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 p-8">
    <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.name} 👋</h1>
    <p className="mt-1 text-gray-500">
      {user.email} · Role: {user.role}
    </p>

    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-lg font-semibold text-gray-800">My Applications</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <Stat label="Total" value={applicationsStats.total} />
          <Stat label="Pending" value={applicationsStats.pending} />
          <Stat label="Reviewed" value={applicationsStats.reviewed} />
          <Stat label="Accepted" value={applicationsStats.accepted} />
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-lg font-semibold text-gray-800">My Jobs</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <Stat label="Total Posted" value={jobStats.total} />
          <Stat label="Draft" value={jobStats.draft} />
          <Stat label="Open" value={jobStats.open} />
          <Stat label="Closed" value={jobStats.closed} />
        </div>
      </div>
    </div>
  </main>
);

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded bg-sky-50 p-3">
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-gray-500">{label}</p>
    </div>
  );
}
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded bg-gray-800 p-3">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-gray-400">{label}</p>
    </div>
  );
}