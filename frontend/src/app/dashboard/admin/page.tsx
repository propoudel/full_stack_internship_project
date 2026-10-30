"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../../lib/axios";

// Add a line here when a new admin page is built
const adminLinks = [
  { href: "/dashboard/admin/users", label: "Manage Users" },
  { href: "/dashboard/admin/companies", label: "Manage Companies" },
  { href: "/dashboard/admin/jobs", label: "Moderate Jobs" },
  { href: "/dashboard/admin/applications", label: "Applications Overview" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get("/auth/me");
        setUser(userRes.data.data);

        const statsRes = await api.get("/admin/stats");
        setStats(statsRes.data.data);
      } catch (err: any) {
        if (err.response?.status === 403) {
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading || !user || !stats) return null;

  const roleColors: Record<string, string> = {
    User: "bg-gray-100 text-gray-700",
    JobSeeker: "bg-sky-100 text-sky-700",
    Employer: "bg-emerald-100 text-emerald-700",
    Admin: "bg-amber-100 text-amber-700",
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="mt-1 text-gray-500">Platform-wide overview</p>

        {/* Platform statistics */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <StatCard label="Total Users" value={stats.totalUsers} color="sky" />
          <StatCard label="Companies" value={stats.totalCompanies} color="emerald" />
          <StatCard label="Total Jobs" value={stats.totalJobs} color="sky" />
          <StatCard label="Open Jobs" value={stats.openJobs} color="emerald" />
          <StatCard label="Applications" value={stats.totalApplications} color="amber" />
        </div>

        {/* Users by role */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="font-semibold text-gray-800">Users by Role</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {stats.usersByRole.map((r: any) => (
              <span
                key={r.role}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  roleColors[r.role] || "bg-gray-100 text-gray-700"
                }`}
              >
                {r.role}: {r.count}
              </span>
            ))}
          </div>
        </div>

        {/* Management links */}
        <div className="mt-8 flex flex-wrap gap-3">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600"
            >
              {link.label}
            </Link>
          ))}
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