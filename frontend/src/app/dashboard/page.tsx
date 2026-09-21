"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/axios";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.data);
      } catch (err) {
        router.push("/login"); // not logged in / invalid cookie
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) return null; // or a loading spinner

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="text-center text-white">
        <h1 className="text-3xl font-bold">Welcome, {user.name} 👋</h1>
        <p className="mt-2 text-gray-400">Role: {user.role}</p>
        <p className="text-gray-400">Email: {user.email}</p>
      </div>
    </main>
  );
}