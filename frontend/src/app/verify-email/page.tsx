"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "../../lib/axios";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const hasVerified = useRef(false);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        setStatus("success");
        setMessage(res.data.message);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed.");
      }
    };

    verify();
  }, [token]);

 return (
  <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-emerald-50 p-4">
    <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-8 text-center shadow-md">
      {status === "loading" && <p className="text-gray-500">Verifying your email...</p>}

      {status === "success" && (
        <>
          <h1 className="text-2xl font-bold text-emerald-600">✅ Verified!</h1>
          <p className="text-gray-600">{message}</p>
          <Link href="/login" className="mt-4 inline-block rounded bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600">
            Go to Login
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <h1 className="text-2xl font-bold text-red-600">❌ Verification Failed</h1>
          <p className="text-gray-600">{message}</p>
        </>
      )}
    </div>
  </main>
);
}