"use client";
import{ useForm } from "../../hooks/useForm";
import { useAuth } from "../../hooks/useAuth";
import Link from "next/link";


export default function LoginPage() {
  const { values, handleChange } = useForm({
    email: "",
    password: "",
  });

  const { login, error, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    login(values);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-lg bg-gray-900 p-8">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>

        {error && ( <p className="rounded bg-red-500/10 p-2 text-sm text-red-400"> {error} </p> )}

        <input type="email" name="email" placeholder="Email" value={values.email} onChange={handleChange} required
          className="w-full rounded bg-gray-800 p-2 text-white outline-none"
        />
        <input
          type="password" name="password" placeholder="Password" value={values.password} onChange={handleChange} required
          className="w-full rounded bg-gray-800 p-2 text-white outline-none"
        />
        <button type="submit" disabled={loading} className="w-full rounded bg-blue-600 p-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="text-center text-sm text-gray-400"> Don't have an account?{" "}
          <Link href="/register" className="text-blue-500 hover:underline">Register</Link>
        </p>
      </form>
    </main>
  );
}