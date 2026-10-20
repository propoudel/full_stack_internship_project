"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../lib/axios";

const ROLES = ["User", "JobSeeker", "Employer", "Admin"];

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

export default function AdminUsersPage() {
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    isActive: "",
    page: 1,
  });

  // Check who is logged in (to disable controls on your own row)
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/auth/me");
        setCurrentUserId(res.data.data.id);
      } catch {
        router.push("/login");
      }
    };
    fetchMe();
  }, [router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );
      const res = await api.get("/admin/users", { params });
      setUsers(res.data.data);
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
    fetchUsers();
  }, [filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchInput, page: 1 });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handleRoleChange = async (userId: number, role: string) => {
    setError("");
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      fetchUsers();
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  const handleStatusToggle = async (userId: number, isActive: boolean) => {
    setError("");
    const action = isActive ? "activate" : "deactivate";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive });
      fetchUsers();
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <p className="mt-1 text-gray-500">{pagination.total} users total</p>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-3 rounded-lg bg-white p-4 shadow-md md:flex-row">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <input
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              className="rounded bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600"
            >
              Search
            </button>
          </form>

          <select
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            className="rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400"
          >
            <option value="">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <select
            name="isActive"
            value={filters.isActive}
            onChange={handleFilterChange}
            className="rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400"
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Deactivated</option>
          </select>
        </div>

        {error && (
          <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}

        {/* Users table */}
        <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow-md">
          <table className="w-full text-left text-sm">
            <thead className="bg-sky-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isSelf = user.id === currentUserId;
                  return (
                    <tr key={user.id} className="border-t border-sky-50">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {user.name}
                        {isSelf && <span className="ml-2 text-xs text-emerald-600">(you)</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{user.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          disabled={isSelf}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="rounded border border-sky-200 bg-sky-50 px-2 py-1 text-gray-700 disabled:opacity-50"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            user.isVerified
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {user.isVerified ? "Verified" : "Unverified"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            user.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.isActive ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          disabled={isSelf}
                          onClick={() => handleStatusToggle(user.id, !user.isActive)}
                          className={`rounded px-3 py-1 text-xs font-medium disabled:opacity-40 ${
                            user.isActive
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          }`}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  );
                })
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
    </main>
  );
}