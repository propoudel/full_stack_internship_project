"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/axios";


export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const redirectByRole = async () => {
      try {
        const res = await api.get("/auth/me");
        const role = res.data.data.role;


        if (role === "Admin") {
          router.replace("/dashboard/admin");
        } else if (role === "Employer") {
          router.replace("/dashboard/employer");
        } else {
          router.replace("/dashboard/jobseeker");
        }
      } catch {
        router.replace("/login");
      }
    };

    redirectByRole();
  }, [router]);

  return <p className="p-8 text-gray-500">Loading your dashboard...</p>;
}