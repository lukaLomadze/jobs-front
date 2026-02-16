"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getCookie } from "cookies-next";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/companies", label: "Companies" },
  { href: "/admin/applications", label: "Applications" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const token = getCookie("token") as string | undefined;

  useEffect(() => {
    if (!token) {
      router.push("/auth/sign-in");
    }
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="w-full">
      <div
        className="border-b pb-4 mb-6"
        style={{ borderColor: "rgba(59,130,246,.12)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
                style={{
                  background: "linear-gradient(135deg,#ef4444,#dc2626)",
                  boxShadow: "0 2px 8px rgba(239,68,68,.3)",
                }}
              >
                A
              </div>
              <span className="font-bold text-slate-100 text-sm">Admin</span>
              <span className="tg tr text-[.6rem] tracking-widest">
                RESTRICTED
              </span>
            </div>
            <nav className="flex gap-1">
              {[
                { href: "/admin", label: "Dashboard" },
                { href: "/admin/companies", label: "Companies" },
                { href: "/admin/applications", label: "Applications" },
              ].map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${pathname === n.href ? "text-blue-400" : "text-slate-500 hover:text-blue-400"}`}
                  style={
                    pathname === n.href
                      ? {
                          background: "rgba(59,130,246,.12)",
                          border: "1px solid rgba(59,130,246,.22)",
                        }
                      : {}
                  }
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Back to site
          </Link>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}
