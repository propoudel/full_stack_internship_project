"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../lib/axios";

interface CompanyForm {
  name: string;
  description: string;
  logo: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  companySize: string;
}

const emptyForm: CompanyForm = {
  name: "",
  description: "",
  logo: "",
  website: "",
  email: "",
  phone: "",
  address: "",
  industry: "",
  companySize: "",
};

const FIELDS: { name: keyof CompanyForm; label: string; type?: string; textarea?: boolean }[] = [
  { name: "name", label: "Company Name" },
  { name: "description", label: "Description", textarea: true },
  { name: "logo", label: "Logo URL" },
  { name: "website", label: "Website URL" },
  { name: "email", label: "Company Email", type: "email" },
  { name: "phone", label: "Phone" },
  { name: "address", label: "Address" },
  { name: "industry", label: "Industry" },
  { name: "companySize", label: "Company Size" },
];

const inputClass =
  "w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400";

// Turns backend validation errors into readable text
function getErrorMessage(err: any): string {
  const data = err.response?.data;
  const fieldErrors = data?.errors?.properties;
  if (fieldErrors) {
    const messages = Object.values(fieldErrors).flatMap((f: any) => f.errors || []);
    if (messages.length) return messages.join(" · ");
  }
  return data?.message || "Something went wrong";
}

export default function AdminCompaniesPage() {
  const router = useRouter();

  const [companies, setCompanies] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({ search: "", page: 1 });

  // Edit modal state
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<CompanyForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deleting, setDeleting] = useState<any>(null);
  const [deleteDetails, setDeleteDetails] = useState<any>(null);
  const [confirmText, setConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );
      const res = await api.get("/admin/companies", { params });
      setCompanies(res.data.data);
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
    fetchCompanies();
  }, [filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchInput, page: 1 });
  };

  // ----- Edit -----
  const openEdit = (company: any) => {
    setNotice("");
    setFormError("");
    setEditing(company);
    setForm({
      name: company.name,
      description: company.description,
      logo: company.logo,
      website: company.website,
      email: company.email,
      phone: company.phone,
      address: company.address,
      industry: company.industry,
      companySize: company.companySize,
    });
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await api.put(`/admin/companies/${editing.id}`, form);
      setNotice(`"${form.name}" was updated.`);
      setEditing(null);
      fetchCompanies();
    } catch (err: any) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // ----- Delete -----
  const openDelete = async (company: any) => {
    setNotice("");
    setDeleting(company);
    setDeleteDetails(null);
    setConfirmText("");
    setDeleteError("");
    try {
      // Fetch job and application counts so the admin sees what will be removed
      const res = await api.get(`/admin/companies/${company.id}`);
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
      const res = await api.delete(`/admin/companies/${deleting.id}`);
      const { deletedJobs, deletedApplications } = res.data.data;
      setNotice(
        `"${deleting.name}" was deleted, along with ${deletedJobs} job(s) and ${deletedApplications} application(s).`
      );
      setDeleting(null);

      // If we just removed the last row on this page, step back one page
      if (companies.length === 1 && filters.page > 1) {
        setFilters({ ...filters, page: filters.page - 1 });
      } else {
        fetchCompanies();
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
        <h1 className="text-2xl font-bold text-gray-800">Company Management</h1>
        <p className="mt-1 text-gray-500">{pagination.total} companies total</p>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="mt-6 flex gap-2 rounded-lg bg-white p-4 shadow-md"
        >
          <input
            placeholder="Search by name, email or industry..."
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

        {notice && (
          <p className="mt-4 rounded bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>
        )}
        {error && (
          <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}

        {/* Companies table */}
        <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow-md">
          <table className="w-full text-left text-sm">
            <thead className="bg-sky-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Jobs</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    No companies found.
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id} className="border-t border-sky-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={company.logo}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                        <div>
                          <p className="font-medium text-gray-800">{company.name}</p>
                          <p className="text-xs text-gray-500">
                            {company.industry} · {company.companySize}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-800">{company.owner?.name}</p>
                      <p className="text-xs text-gray-500">{company.owner?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{company._count.jobs}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(company.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(company)}
                          className="rounded bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700 hover:bg-sky-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDelete(company)}
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

      {/* Edit modal */}
      {editing && (
        <Modal title={`Edit ${editing.name}`} onClose={() => !saving && setEditing(null)}>
          <form onSubmit={handleSave} className="space-y-3">
            {formError && (
              <p className="rounded bg-red-50 p-2 text-sm text-red-600">{formError}</p>
            )}

            {FIELDS.map((field) =>
              field.textarea ? (
                <textarea
                  key={field.name}
                  name={field.name}
                  placeholder={field.label}
                  value={form[field.name]}
                  onChange={handleFormChange}
                  required
                  rows={3}
                  className={inputClass}
                />
              ) : (
                <input
                  key={field.name}
                  name={field.name}
                  type={field.type || "text"}
                  placeholder={field.label}
                  value={form[field.name]}
                  onChange={handleFormChange}
                  required
                  className={inputClass}
                />
              )
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                disabled={saving}
                className="rounded bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete modal */}
      {deleting && (
        <Modal title="Delete company" onClose={() => !deleteBusy && setDeleting(null)}>
          <p className="text-sm text-gray-600">
            You are about to permanently delete <strong>{deleting.name}</strong>.
          </p>

          {!deleteDetails && !deleteError && (
            <p className="mt-3 text-sm text-gray-500">Checking what will be deleted...</p>
          )}

          {deleteDetails && (
            <div className="mt-3 rounded bg-red-50 p-3 text-sm text-red-700">
              This will also delete:
              <ul className="mt-1 list-disc pl-5">
                <li>{deleteDetails._count.jobs} job posting(s)</li>
                <li>
                  {deleteDetails.applicationCount} application(s) submitted to those jobs
                </li>
                <li>All saved-job bookmarks for those jobs</li>
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
                Type <strong>{deleting.name}</strong> to confirm:
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
                confirmText.trim() !== deleting.name.trim() ||
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