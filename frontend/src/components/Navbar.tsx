"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Briefcase,
  LayoutDashboard,
  Building2,
  FileText,
  ClipboardList,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import api from "../lib/axios";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
  try {
    await api.post("/auth/logout");
  } finally {
    setUser(null);
    router.push("/");
  }
};

  if (["/login", "/register", "/verify-email"].includes(pathname)) {
    return null;
  }

  const navLinks = [
    { href: "/jobs", label: "Browse Jobs", icon: Briefcase },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/company/me", label: "My Company", icon: Building2 },
    { href: "/jobs/me", label: "My Jobs", icon: FileText },
    { href: "/applications/me", label: "Applications", icon: ClipboardList },
  ];

  const isActive = (href: string) =>
    href === "/jobs" ? pathname === "/jobs" : pathname.startsWith(href);

  const initials = user?.name
    ?.split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <nav className="sticky top-0 z-50 border-b border-sky-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-sky-500 text-white">
            <Briefcase size={18} />
          </span>
          <span className="bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
            Job Portal
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          <Link
            href="/jobs"
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              isActive("/jobs")
                ? "bg-emerald-50 text-emerald-700"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
            }`}
          >
            <Briefcase size={15} />
            Browse Jobs
          </Link>

          {!loading && user && (
            <>
              {navLinks.slice(1).map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    isActive(href)
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              ))}
            </>
          )}
        </div>

        {/* Right side: auth state */}
        <div className="hidden items-center gap-3 md:flex">
          {!loading && user && (
            <>
              <div className="flex items-center gap-2 rounded-full bg-sky-50 py-1 pl-1 pr-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 text-xs font-semibold text-white">
                  {initials}
                </span>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
              >
                <LogOut size={15} />
                Logout
              </button>
            </>
          )}

          {!loading && !user && (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-emerald-600"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:shadow-md"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-gray-600 md:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="space-y-1 border-t border-sky-100 bg-white px-6 py-4 md:hidden">
          <Link href="/jobs" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Browse Jobs
          </Link>

          {!loading && user && (
            <>
              {navLinks.slice(1).map(({ href, label }) => (
                <Link key={href} href={href} className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  {label}
                </Link>
              ))}
              <div className="mt-2 flex items-center justify-between border-t border-sky-100 pt-3">
                <span className="text-sm text-gray-500">{user.name}</span>
                <button onClick={handleLogout} className="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-600">
                  Logout
                </button>
              </div>
            </>
          )}

          {!loading && !user && (
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1 rounded-full border border-gray-200 py-2 text-center text-sm font-medium text-gray-600">
                Login
              </Link>
              <Link href="/register" className="flex-1 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 py-2 text-center text-sm font-medium text-white">
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}