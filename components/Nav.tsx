"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCookie, deleteCookie } from "cookies-next";
import axiosInstance from "@/lib/axios-instance";
import { Button } from "@/components/ui/button";
import type { User, Role } from "@/types";

export function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const token = getCookie("token") as string | undefined;

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    axiosInstance
      .get("/auth/current-user")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, [token, pathname]);

  const handleLogout = () => {
    deleteCookie("token");
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-semibold text-foreground hover:text-foreground/90"
        >
          Jobs Board
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            }`}
          >
            Vacancies
          </Link>
          {!user && (
            <>
              <Link href="/auth/sign-in">
                <Button variant="ghost" size="sm" className="font-medium">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="sm" className="font-medium">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
          {user?.role === "user" && (
            <>
              <Link href="/user/applications">
                <Button variant="ghost" size="sm" className="font-medium">
                  My Applications
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="font-medium"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          )}
          {user?.role === "company" && (
            <>
              <Link href="/company">
                <Button variant="ghost" size="sm" className="font-medium">
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="font-medium"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          )}
          {user?.role === "admin" && (
            <>
              <Link href="/admin">
                <Button
                  variant="default"
                  size="sm"
                  className="font-medium bg-primary text-primary-foreground"
                >
                  Admin
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="font-medium"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
