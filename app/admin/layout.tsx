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
}: { children: React.ReactNode }) {
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
      <div className="border-b border-border/60 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="text-lg font-semibold text-foreground hover:underline"
            >
              Admin
            </Link>
            <nav className="flex gap-1">
              {nav.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            ← Back to site
          </Link>
        </div>
      </div>
      <div className="pt-6">{children}</div>
    </div>
  );
}
