"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../lib/axios";

const STATUSES = ["Draft", "Open", "Closed", "Suspended"];

const statusColors: Record<string, string> = {
  Draft: "bg-amber-100 text-amber-700",
  Open: "bg-emerald-100 text-emerald-700",
  Closed: "bg-gray-200 text-gray-600",
  Suspended: "bg-red-100 text-red-700",
};

const inputClass =
  "w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400";

function getErrorMessage(err: any): string {
  const data = err.response?.data;
  const fieldErrors = data?.errors?.properties;
  if (fieldErrors) {
    const messages = Object.values(fieldErrors).flatMap((f: any) => f.errors || []);
    if (messages.length) return messages.join(" · ");
  }
  if (data?.message) return data.message;
  if (err.response) return `Request failed (status ${err.response.status})`;
  return "Cannot reach the server. Is the backend running?";
}

export default function AdminJobsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({ search: "", status: "", page: 1 });

  // Details modal (uses the row data, which already includes every job field)
  const [viewing, setViewing] = useState<any>(null);

  // Delete modal
  const [deleting, setDeleting] = useState<any>(null);
  const [deleteDetails, setDeleteDetails] = useState<any>(null);
  const [confirmText, setConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );
      const res = await api.get("/admin/jobs", { params });
      setJobs(res.data.data);
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
    fetchJobs();
  }, [filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchInput, page: 1 });
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, status: e.target.value, page: 1 });
  };

  // ----- Suspend / Restore -----
  const handleStatusChange = async (job: any, status: "Suspended" | "Open") => {
    setError("");
    setNotice("");

    const message =
      status === "Suspended"
        ? `Suspend "${job.title}"?\n\nIt will be hidden from the public, and its owner will not be able to reopen it.`
        : `Restore "${job.title}"?\n\nIt will become visible to the public again.`;
    if (!confirm(message)) return;

    setBusyId(job.id);
    try {
      await api.patch(`/admin/jobs/${job.id}/status`, { status });
      setNotice(
        status === "Suspended"
          ? `"${job.title}" was suspended.`
          : `"${job.title}" was restored.`
      );
      fetchJobs();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  // ----- Delete -----
  const openDelete = async (job: any) => {
    setNotice("");
    setDeleting(job);
    setDeleteDetails(null);
    setConfirmText("");
    setDeleteError("");
    try {
      // Fetch fresh counts, so the admin sees exactly what will be removed
      const res = await api.get(`/admin/jobs/${job.id}`);
      setDeleteDetails(res.data.data);
    } catch (err: any) {
      setDeleteError(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      const res = await api.delete(`/admin/jobs/${deleting.id}`);
      const { deletedApplications, deletedSavedJobs } = res.data.data;
      setNotice(
        `"${deleting.title}" was deleted, along with ${deletedApplications} application(s) and ${deletedSavedJobs} bookmark(s).`
      );
      setDeleting(null);

      // If we just removed the last row on this page, step back one page
      if (jobs.length === 1 && filters.page > 1) {
        setFilters({ ...filters, page: filters.page - 1 });
      } else {
        fetchJobs();
      }
    } catch (err: any) {
      setDeleteError(getErrorMessage(err));
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-800">Job Moderation</h1>
        <p className="mt-1 text-gray-500">{pagination.total} jobs total</p>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-3 rounded-lg bg-white p-4 shadow-md md:flex-row">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <input
              placeholder="Search by title, location or company..."
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

          <select
            value={filters.status}
            onChange={handleStatusFilter}
            className="rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {notice && (
          <p className="mt-4 rounded bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>
        )}
        {error && (
          <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}

        {/* Jobs table */}
        <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow-md">
          <table className="w-full text-left text-sm">
            <thead className="bg-sky-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Applications</th>
                <th className="px-4 py-3">Saved</th>
                <th className="px-4 py-3">Posted</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    No jobs found.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="border-t border-sky-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{job.title}</p>
                      <p className="text-xs text-gray-500">
                        {job.location} · {job.employmentType}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{job.company?.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          statusColors[job.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{job._count.applications}</td>
                    <td className="px-4 py-3 text-gray-700">{job._count.savedBy}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setViewing(job)}
                          className="rounded bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700 hover:bg-sky-200"
                        >
                          View
                        </button>

                        {job.status === "Open" && (
                          <button
                            onClick={() => handleStatusChange(job, "Suspended")}
                            disabled={busyId === job.id}
                            className="rounded bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200 disabled:opacity-50"
                          >
                            Suspend
                          </button>
                        )}

                        {job.status === "Suspended" && (
                          <button
                            onClick={() => handleStatusChange(job, "Open")}
                            disabled={busyId === job.id}
                            className="rounded bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-200 disabled:opacity-50"
                          >
                            Restore
                          </button>
                        )}

                        <button
                          onClick={() => openDelete(job)}
                          className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
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
        <Modal title={viewing.title} onClose={() => setViewing(null)}>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded px-2 py-1 text-xs font-medium ${
                  statusColors[viewing.status] || "bg-gray-100 text-gray-700"
                }`}
              >
                {viewing.status}
              </span>
              <span className="text-gray-500">at {viewing.company?.name}</span>
            </div>

            <p>
              {viewing.location} · {viewing.employmentType} · {viewing.experienceLevel}
            </p>
            <p className="text-emerald-600">
              NPR {viewing.salaryMin.toLocaleString()} - {viewing.salaryMax.toLocaleString()}
            </p>
            <p className="text-gray-500">
              Deadline: {new Date(viewing.deadline).toLocaleDateString()}
            </p>

            <div>
              <h3 className="font-semibold text-gray-800">Description</h3>
              <p className="mt-1 whitespace-pre-wrap">{viewing.description}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">Requirements</h3>
              <p className="mt-1 whitespace-pre-wrap">{viewing.requirements}</p>
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

      {/* Delete modal */}
      {deleting && (
        <Modal title="Delete job" onClose={() => !deleteBusy && setDeleting(null)}>
          <p className="text-sm text-gray-600">
            You are about to permanently delete <strong>{deleting.title}</strong>.
          </p>

          {!deleteDetails && !deleteError && (
            <p className="mt-3 text-sm text-gray-500">Checking what will be deleted...</p>
          )}

          {deleteDetails && (
            <div className="mt-3 rounded bg-red-50 p-3 text-sm text-red-700">
              This will also delete:
              <ul className="mt-1 list-disc pl-5">
                <li>{deleteDetails._count.applications} application(s) submitted to this job</li>
                <li>{deleteDetails._count.savedBy} saved-job bookmark(s)</li>
              </ul>
              <p className="mt-2 font-medium">This cannot be undone.</p>
            </div>
          )}

          {deleteError && (
            <p className="mt-3 rounded bg-red-50 p-2 text-sm text-red-600">{deleteError}</p>
          )}

          {deleteDetails && (
            <>
              <label className="mt-4 block text-sm text-gray-600">
                Type <strong>{deleting.title}</strong> to confirm:
              </label>
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className={`mt-1 ${inputClass}`}
              />
            </>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setDeleting(null)}
              disabled={deleteBusy}
              className="rounded bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={
                !deleteDetails ||
                confirmText.trim() !== deleting.title.trim() ||
                deleteBusy
              }
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
            >
              {deleteBusy ? "Deleting..." : "Delete permanently"}
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