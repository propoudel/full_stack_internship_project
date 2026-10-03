"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../lib/axios";

export default function JobListingPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    location: "",
    employmentType: "",
    experienceLevel: "",
    sortBy: "createdAt",
    order: "desc",
    page: 1,
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );
      const res = await api.get("/jobs", { params });
      setJobs(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const goToPage = (page: number) => {
    setFilters({ ...filters, page });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Browse Jobs</h1>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 gap-3 rounded-lg bg-white p-4 shadow-md md:grid-cols-3">
          <input
            name="search"
            placeholder="Search by title..."
            value={filters.search}
            onChange={handleFilterChange}
            className="rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400"
          />
          <input
            name="location"
            placeholder="Location"
            value={filters.location}
            onChange={handleFilterChange}
            className="rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400"
          />
          <select
            name="employmentType"
            value={filters.employmentType}
            onChange={handleFilterChange}
            className="rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400"
          >
            <option value="">All Types</option>
            <option value="FullTime">Full Time</option>
            <option value="PartTime">Part Time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Remote">Remote</option>
          </select>
          <input
            name="experienceLevel"
            placeholder="Experience Level"
            value={filters.experienceLevel}
            onChange={handleFilterChange}
            className="rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400"
          />
          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
            className="rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400"
          >
            <option value="createdAt">Newest</option>
            <option value="salaryMin">Salary</option>
            <option value="deadline">Deadline</option>
          </select>
          <select
            name="order"
            value={filters.order}
            onChange={handleFilterChange}
            className="rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        {/* Job list */}
        {loading ? (
          <p className="text-gray-500">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-gray-500">No jobs found matching your criteria.</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block rounded-lg bg-white p-6 shadow-md transition hover:shadow-lg"
              >
                <h2 className="text-lg font-semibold text-gray-800">{job.title}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {job.location} · {job.employmentType} · {job.experienceLevel}
                </p>
                <p className="mt-2 text-sm text-emerald-600">
                  NPR {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
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