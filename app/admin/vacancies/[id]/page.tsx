"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import type { Company, Vacancy } from "@/types";

export default function AdminVacancyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const token = getCookie("token") as string | undefined;
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/auth/sign-in");
      return;
    }
    axiosInstance
      .get(`/vacancies/admin/${id}`)
      .then((res) => setVacancy(res.data))
      .catch(() => setVacancy(null))
      .finally(() => setLoading(false));
  }, [id, token, router]);

  const approve = async () => {
    try {
      await axiosInstance.patch(`/vacancies/admin/${id}/approve`);
      router.push("/admin");
    } catch {}
  };

  const reject = async () => {
    try {
      await axiosInstance.patch(`/vacancies/admin/${id}/reject`);
      router.push("/admin");
    } catch {}
  };

  if (!vacancy)
    return <p className="text-muted-foreground">Vacancy not found.</p>;

  const company =
    typeof vacancy.companyId === "object" ? vacancy.companyId : null;

  if (!token) return null;
  if (loading)
    return (
      <div className="space-y-4 py-4 max-w-xl">
        <div className="sk h-4 w-20" />
        <div className="uc p-7 space-y-4">
          <div className="sk h-6 w-3/5" />
          <div className="sk h-4 w-2/5" />
          <div className="sk h-3 w-full mt-3" />
          <div className="sk h-3 w-5/6" />
        </div>
      </div>
    );

  return (
    <div className="space-y-5 max-w-xl">
      <Link
        href="/admin"
        className="text-xs text-slate-500 hover:text-blue-400 transition-colors inline-block"
      >
        ← Back to admin
      </Link>
      <div className="uc p-7 as">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
          <div>
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mb-2">
              {vacancy.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              {vacancy.location && (
                <span className="tg tb">📍 {vacancy.location}</span>
              )}
              {vacancy.category && (
                <span className="tg tv">🏷 {vacancy.category}</span>
              )}
              {company && (
                <span className="tg tb">🏢 {(company as Company).name}</span>
              )}
              <span
                className={`tg ${vacancy.status === "approved" ? "tg2" : "ty"}`}
              >
                {vacancy.status}
              </span>
            </div>
          </div>
        </div>

        <div
          className="h-px mb-5"
          style={{ background: "rgba(59,130,246,.1)" }}
        />
        <p className="lbl">DESCRIPTION</p>
        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-400 leading-relaxed mb-6">
          {vacancy.description}
        </p>

        {vacancy.status === "pending" && (
          <div className="flex gap-3">
            <button onClick={approve} className="bp flex-1 py-3 text-sm">
              ✓ Approve
            </button>
            <button onClick={reject} className="bd flex-1 py-3 text-sm">
              ✕ Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
