"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/axios";

export default function MyApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get("/applications/me");
        setApplications(res.data.data);
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [router]);

  if (loading) return null;

  const statusColors: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-700",
    Reviewed: "bg-sky-100 text-sky-700",
    Accepted: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-red-100 text-red-700",
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">My Applications</h1>

        {applications.length === 0 && (
          <p className="text-gray-500">You haven't applied to any jobs yet.</p>
        )}

        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="rounded-lg bg-white p-6 shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Applied on {new Date(app.appliedAt).toLocaleDateString()}
                </p>
                <span className={`rounded px-2 py-1 text-xs font-medium ${statusColors[app.status]}`}>
                  {app.status}
                </span>
              </div>
              {app.experience && (
                <p className="mt-2 text-sm text-gray-600">{app.experience}</p>
              )}
              <a
                href={app.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-emerald-600 hover:underline"
              >
                View Resume
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}