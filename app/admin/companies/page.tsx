"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCookie } from "cookies-next";
import axiosInstance from "@/lib/axios-instance";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Company } from "@/types";

export default function AdminCompaniesPage() {
  const router = useRouter();
  const token = getCookie("token") as string | undefined;
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const take = 20;

  useEffect(() => {
    if (!token) {
      router.push("/auth/sign-in");
      return;
    }
    axiosInstance
      .get("/companies", { params: { page, take } })
      .then((res) => setCompanies(res.data ?? []))
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  }, [token, router, page]);

  const approve = async (id: string) => {
    try {
      await axiosInstance.patch(`/companies/${id}/approve`);
      setCompanies((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, isApproved: true } : c
        )
      );
    } catch {}
  };

  const ban = async (id: string) => {
    try {
      await axiosInstance.patch(`/companies/${id}/ban`);
      setCompanies((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, isApproved: false } : c
        )
      );
    } catch {}
  };

  if (!token) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          All companies
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approve or ban any company. Page {page}.
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <Card className="overflow-hidden border-border/80 shadow-sm">
          <CardHeader className="bg-muted/40">
            <CardTitle>Companies</CardTitle>
            <CardDescription>Full list of registered companies</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {companies.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/80 py-12 text-center text-sm text-muted-foreground">
                No companies found.
              </p>
            ) : (
              <ul className="divide-y divide-border/80">
                {companies.map((c) => (
                  <li
                    key={c._id}
                    className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {c.email}
                        <span
                          className={
                            c.isApproved
                              ? "ml-2 text-green-600 dark:text-green-400"
                              : "ml-2 text-amber-600 dark:text-amber-400"
                          }
                        >
                          · {c.isApproved ? "Approved" : "Not approved"}
                        </span>
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {!c.isApproved && (
                        <Button
                          size="sm"
                          onClick={() => approve(c._id)}
                          className="bg-primary text-primary-foreground"
                        >
                          Approve
                        </Button>
                      )}
                      {c.isApproved && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => ban(c._id)}
                        >
                          Ban
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {companies.length >= take && (
              <div className="mt-6 flex justify-center gap-2 border-t border-border/80 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
