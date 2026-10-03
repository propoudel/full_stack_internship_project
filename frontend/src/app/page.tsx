"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Briefcase, Building2, Users, ArrowRight } from "lucide-react";
import api from "../lib/axios";

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs", { params: { limit: 6, sortBy: "createdAt", order: "desc" } });
        setFeaturedJobs(res.data.data);
        setTotalJobs(res.data.pagination.total);
      } catch (err) {
        console.error(err);
      }
    };


    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.data);
      } catch {
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    fetchJobs();
    checkAuth();
  }, []);

  const handlePostJobClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/login");
      return;
    }

    try {
      await api.get("/companies/me/company");
      router.push("/jobs/create");
    } catch (err: any) {
      if (err.response?.status === 404) {
        alert("You should create a company first to post a job.");
        router.push("/company/create");
      } else {
        router.push("/company/me");
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (location) params.set("location", location);
    router.push(`/jobs?${params.toString()}`);
  };

  const categories = [
    { label: "Full Time", value: "FullTime" },
    { label: "Part Time", value: "PartTime" },
    { label: "Contract", value: "Contract" },
    { label: "Internship", value: "Internship" },
    { label: "Remote", value: "Remote" },
  ];

  return (
    <main className="bg-gradient-to-br from-sky-50 to-emerald-50">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-16 pt-20 text-center">
        <h1 className="text-4xl font-bold text-gray-800 md:text-5xl">
          Find your next{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
            opportunity
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-gray-500">
          Browse thousands of job openings from top companies, or post a job and find your next great hire.
        </p>

        <form
          onSubmit={handleSearch}
          className="mx-auto mt-8 flex max-w-2xl flex-col gap-2 rounded-xl bg-white p-2 shadow-md sm:flex-row"
        >
          <div className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2">
            <Search size={18} className="text-gray-400" />
            <input
              placeholder="Job title or keyword"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-gray-800 outline-none placeholder:text-gray-400"
            />
          </div>
          <div className="hidden h-6 w-px bg-gray-200 sm:block" />
          <div className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2">
            <MapPin size={18} className="text-gray-400" />
            <input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-gray-800 outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 px-6 py-2 font-medium text-white shadow-sm transition hover:shadow-md"
          >
            Search
          </button>
        </form>
            
        

        <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
          {categories.map((c) => (
            <Link
              key={c.value}
              href={`/jobs?employmentType=${c.value}`}
              className="rounded-full bg-white px-3 py-1 text-gray-600 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-4 px-6 pb-16 sm:grid-cols-3">
        <StatCard icon={Briefcase} value={`${totalJobs}+`} label="Open Jobs" />
        <StatCard icon={Building2} value="Growing" label="Companies Hiring" />
        <StatCard icon={Users} value="Free" label="To Apply" />
      </section>

      {/* Featured jobs */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Latest Openings</h2>
          <Link href="/jobs" className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:underline">
            View all jobs <ArrowRight size={14} />
          </Link>
        </div>

        {featuredJobs.length === 0 ? (
          <p className="text-gray-500">No open positions right now — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredJobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="font-semibold text-gray-800">{job.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{job.location}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">
                    {job.employmentType}
                  </span>
                  <span className="text-xs text-emerald-600">
                    NPR {job.salaryMin.toLocaleString()}+
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Employer CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 p-8 text-center text-white sm:flex-row sm:text-left">
          <div>
            <h2 className="text-xl font-bold">Hiring? Post a job in minutes.</h2>
            <p className="mt-1 text-emerald-50">Reach qualified candidates looking for their next role.</p>
          </div>
          <button
            onClick={handlePostJobClick}
            className="whitespace-nowrap rounded-lg bg-white px-5 py-2 font-medium text-emerald-700 shadow-sm transition hover:shadow-md"
          >
            Post a Job
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sky-100 bg-white py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Job Portal. Built with Next.js & Express.
      </footer>
    </main>
  );
}

function StatCard({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        <Icon size={18} />
      </span>
      <div>
        <p className="font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}