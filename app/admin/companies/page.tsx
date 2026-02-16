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
        prev.map((c) => (c._id === id ? { ...c, isApproved: true } : c)),
      );
    } catch {}
  };

  const ban = async (id: string) => {
    try {
      await axiosInstance.patch(`/companies/${id}/ban`);
      setCompanies((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isApproved: false } : c)),
      );
    } catch {}
  };

  if (!token) return null;

  return (
    <div className="space-y-5">
      <div className="au">
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          All companies
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Approve or ban any company · Page {page}
        </p>
      </div>
      {loading ? (
        <div className="uc p-5 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="sk h-14" />
          ))}
        </div>
      ) : (
        <div className="uc overflow-hidden au d1">
          {companies.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              No companies found.
            </p>
          ) : (
            <div className="p-4 space-y-2">
              {companies.map((c) => (
                <div
                  key={c._id}
                  className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl"
                  style={{
                    background: "rgba(26,41,66,.5)",
                    border: "1px solid rgba(59,130,246,.08)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-blue-400 text-sm"
                      style={{
                        background: "linear-gradient(135deg,#1a2942,#1e3560)",
                        border: "1px solid rgba(59,130,246,.2)",
                      }}
                    >
                      {c.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200 text-sm">
                        {c.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {c.email}{" "}
                        <span
                          className={`ml-1 tg text-[.62rem] ${c.isApproved ? "tg2" : "ty"}`}
                        >
                          {c.isApproved ? "✓ Approved" : "⏳ Not approved"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!c.isApproved && (
                      <button
                        className="bp px-3.5 py-1.5 text-xs"
                        onClick={() => approve(c._id)}
                      >
                        Approve
                      </button>
                    )}
                    {c.isApproved && (
                      <button
                        className="bd px-3.5 py-1.5 text-xs"
                        onClick={() => ban(c._id)}
                      >
                        Ban
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {companies.length >= take && (
            <div
              className="flex justify-center gap-2 p-4 border-t"
              style={{ borderColor: "rgba(59,130,246,.08)" }}
            >
              <button
                className="bg px-4 py-2 text-xs"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Previous
              </button>
              <span className="px-3 py-2 text-xs text-slate-500">
                Page {page}
              </span>
              <button
                className="bg px-4 py-2 text-xs"
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
