"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../lib/axios";

const STATUSES = ["Pending", "Reviewed", "Accepted", "Rejected"];

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Reviewed: "bg-sky-100 text-sky-700",
  Accepted: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
};

const jobStatusColors: Record<string, string> = {
  Draft: "bg-amber-100 text-amber-700",
  Open: "bg-emerald-100 text-emerald-700",
  Closed: "bg-gray-200 text-gray-600",
  Suspended: "bg-red-100 text-red-700",
};

const inputClass =
  "w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400";

// Applicants type their resume URL, so only open ordinary web links
const isSafeUrl = (url: string) => /^https?:\/\//i.test(url);

function getErrorMessage(err: any): string {
  const data = err.response?.data;
  if (data?.message) return data.message;
  if (err.response) return `Request failed (status ${err.response.status})`;
  return "Cannot reach the server. Is the backend running?";
}

export default function AdminApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<any[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({ search: "", status: "", page: 1 });

  const [viewing, setViewing] = useState<any>(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );
      const res = await api.get("/admin/applications", { params });
      setApplications(res.data.data);
      setStatusCounts(res.data.statusCounts);
      setPagination(res.data.pagination);
    } catch (err: any) {
      if (err.response?.status === 403) {
        router.push("/dashboard");
      } else if (err.response?.status === 401) {
        router.push("/login");
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchInput, page: 1 });
  };

  const platformTotal = Object.values(statusCounts).reduce((sum, c) => sum + c, 0);

  const cards = [
    { label: "All", value: platformTotal, status: "" },
    ...STATUSES.map((s) => ({ label: s, value: statusCounts[s] ?? 0, status: s })),
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-800">Applications Overview</h1>
        <p className="mt-1 text-gray-500">
          Read-only view of every application on the platform
        </p>

        {/* Status cards (click to filter) */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {cards.map((card) => {
            const active = filters.status === card.status;
            return (
              <button
                key={card.label}
                onClick={() => setFilters({ ...filters, status: card.status, page: 1 })}
                className={`rounded-lg p-4 text-center shadow-sm transition ${
                  active
                    ? "bg-emerald-500 text-white"
                    : "bg-white text-gray-800 hover:bg-sky-50"
                }`}
              >
                <p className="text-2xl font-bold">{card.value}</p>
                <p className={`text-xs ${active ? "text-emerald-50" : "text-gray-500"}`}>
                  {card.label}
                </p>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="mt-6 flex gap-2 rounded-lg bg-white p-4 shadow-md"
        >
          <input
            placeholder="Search by applicant, job title or company..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={inputClass}
          />
          <button
            type="submit"
            className="rounded bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600"
          >
            Search
          </button>
        </form>

        <p className="mt-3 text-sm text-gray-500">
          {pagination.total} result(s)
          {filters.status && ` · status: ${filters.status}`}
          {filters.search && ` · search: "${filters.search}"`}
        </p>

        {error && (
          <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}

        {/* Applications table */}
        <div className="mt-4 overflow-x-auto rounded-lg bg-white shadow-md">
          <table className="w-full text-left text-sm">
            <thead className="bg-sky-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Applied</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    No applications found.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="border-t border-sky-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{app.applicant?.name}</p>
                      <p className="text-xs text-gray-500">{app.applicant?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-800">{app.job?.title}</p>
                      <span
                        className={`mt-1 inline-block rounded px-2 py-0.5 text-xs ${
                          jobStatusColors[app.job?.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        Job: {app.job?.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{app.job?.company?.name}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          statusColors[app.status]
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setViewing(app)}
                        className="rounded bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700 hover:bg-sky-200"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setFilters({ ...filters, page: p })}
                className={`rounded px-3 py-1 text-sm ${
                  p === pagination.page
                    ? "bg-emerald-500 text-white"
                    : "bg-white text-gray-600 hover:bg-sky-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details modal */}
      {viewing && (
        <Modal title="Application details" onClose={() => setViewing(null)}>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-800">Applicant</h3>
              <p>{viewing.applicant?.name}</p>
              <p className="text-gray-500">{viewing.applicant?.email}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">Applied for</h3>
              <p>
                {viewing.job?.title} at {viewing.job?.company?.name}
              </p>
              <p className="text-gray-500">
                Applied on {new Date(viewing.appliedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded px-2 py-1 text-xs font-medium ${
                  statusColors[viewing.status]
                }`}
              >
                Application: {viewing.status}
              </span>
              <span
                className={`rounded px-2 py-1 text-xs font-medium ${
                  jobStatusColors[viewing.job?.status] || "bg-gray-100 text-gray-600"
                }`}
              >
                Job: {viewing.job?.status}
              </span>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">Experience</h3>
              {viewing.experience ? (
                <p className="mt-1 whitespace-pre-wrap">{viewing.experience}</p>
              ) : (
                <p className="mt-1 text-gray-400">No experience text provided.</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">Resume</h3>
              {isSafeUrl(viewing.resumeUrl) ? (
                <a
                  href={viewing.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="mt-1 inline-block break-all text-emerald-600 hover:underline"
                >
                  {viewing.resumeUrl}
                </a>
              ) : (
                <p className="mt-1 break-all text-red-600">
                  Unsafe link, not opened: {viewing.resumeUrl}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={() => setViewing(null)}
              className="rounded bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}