"use client";

import Link from "next/link";
import { useForm } from "../../hooks/useForm";
import { useAuth } from "../../hooks/useAuth";

export default function RegisterPage() {
  const { values, handleChange } = useForm({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const { register, error, loading } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(values);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-emerald-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-lg bg-white p-8 shadow-md"
      >
        <h1 className="text-2xl font-bold text-gray-800">Create an account</h1>

        {error && (
          <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>
        )}

        <input type="text" name="name" placeholder="Full name" value={values.name} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400" />
        <input type="email" name="email" placeholder="Email" value={values.email} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400" />
        <input type="text" name="phone" placeholder="Phone" value={values.phone} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400" />
        <input type="password" name="password" placeholder="Password" value={values.password} onChange={handleChange} required className="w-full rounded border border-sky-200 bg-sky-50 p-2 text-gray-800 outline-none focus:border-emerald-400" />

        <button type="submit" disabled={loading} className="w-full rounded bg-emerald-500 p-2 font-medium text-white hover:bg-emerald-600 disabled:opacity-50">
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}