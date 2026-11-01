"use client";

import { useEffect, useState } from "react";;
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../../lib/axios";

export default function SavedJobsPage() {
    const router = useRouter();
    const [savedJobs, setSavedJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSavedJobs = async () => {
        try {
            const res = await api.get("/saved-jobs");
            setSavedJobs(res.data.data);
        } catch (err) {
            router.push("/login");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedJobs();
    }, []);

    const handleRemove = async (jobId: number) => {
        try {
            await api.delete(`/jobs/${jobId}/save`);
            fetchSavedJobs();
        } catch (err: any) {
            alert(err.response?.data?.message || "Something went wrong");
        }
    };
    if (loading) return null;

    return (
        <main className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 p-8">
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-6 text-2xl font bold text-gray-800">Saved Jobs</h1>
                {savedJobs.length === 0 && (
                    <p className="text-gray-500">You have no saved jobs.</p>
                )}

                <div className="space-y-4">
                    {savedJobs.map((saved) => {
                        const available = saved.job.status === "Open";

                        const details = (
                            <>
                                <h2 className="font-semibold text-gray-800">{saved.job.title}</h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    {saved.job.location} · {saved.job.employmentType}
                                </p>
                                <p className="mt-1 text-sm text-emerald-600">
                                    NPR {saved.job.salaryMin.toLocaleString()} - {saved.job.salaryMax.toLocaleString()}
                                </p>
                            </>
                        );

                        return (
                            <div key={saved.id} className="rounded-lg bg-white p-6 shadow-md">
                                <div className="flex items-start justify-between">
                                    {available ? (
                                        <Link href={`/jobs/${saved.job.id}`} className="flex-1 hover:text-emerald-600">
                                            {details}
                                        </Link>
                                    ) : (
                                        <div className="flex-1 opacity-60">
                                            {details}
                                            <span className="mt-2 inline-block rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-600">
                                                No longer available
                                            </span>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleRemove(saved.job.id)}
                                        className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    )
}

