"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getCookie } from "cookies-next";
import axiosInstance from "@/lib/axios-instance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import type { Vacancy } from "@/types";

export default function VacancyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyLoading, setApplyLoading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const token = getCookie("token") as string | undefined;

  useEffect(() => {
    axiosInstance
      .get(`/vacancies/${id}`)
      .then((res) => setVacancy(res.data))
      .catch(() => setVacancy(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvFile || !token) return;
    if (!cvFile.name.endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }
    setApplyLoading(true);
    const formData = new FormData();
    formData.append("vacancyId", id);
    formData.append("cv", cvFile);
    try {
      await axiosInstance.post("/applications", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Application sent!");
      setCvFile(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? "Failed to apply");
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading)
    return (
      <div className="container py-8 max-w-2xl mx-auto space-y-4">
        <div className="sk h-4 w-20 rounded-xl" />
        <div className="uc p-7 space-y-4">
          <div className="flex gap-4">
            <div className="sk w-14 h-14 rounded-xl" />
            <div className="flex-1 space-y-2.5">
              <div className="sk h-6 w-3/5" />
              <div className="sk h-4 w-2/5" />
            </div>
          </div>
          <div className="sk h-3 w-full" />
          <div className="sk h-3 w-5/6" />
          <div className="sk h-3 w-4/6" />
        </div>
      </div>
    );
  if (!vacancy)
    return (
      <div className="container py-10 text-center">
        <div className="uc p-12 max-w-sm mx-auto as">
          <p className="text-4xl mb-3">🔍</p>
          <h2 className="font-bold text-slate-200 mb-2">Vacancy not found</h2>
          <Link href="/">
            <button className="bg px-5 py-2 text-sm mt-2">← Browse jobs</button>
          </Link>
        </div>
      </div>
    );

  const companyName =
    typeof vacancy.companyId === "object" && vacancy.companyId?.name
      ? vacancy.companyId.name
      : "Company";

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <Link
        href="/"
        className="text-xs text-slate-500 hover:text-blue-400 transition-colors mb-6 inline-block"
      >
        ← Back to vacancies
      </Link>

      <div className="uc p-7 mb-4 au">
        <div className="flex gap-4 items-start mb-5">
          <div
            className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-xl text-blue-400"
            style={{
              background: "linear-gradient(135deg,#1a2942,#1e3560)",
              border: "1px solid rgba(59,130,246,.22)",
            }}
          >
            {companyName[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight leading-snug">
              {vacancy.title}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {companyName} · {vacancy.location}
              {vacancy.category ? ` · ${vacancy.category}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {vacancy.location && (
            <span className="tg tb">📍 {vacancy.location}</span>
          )}
          {vacancy.category && (
            <span className="tg tv">🏷 {vacancy.category}</span>
          )}
          {(vacancy.salaryMin != null || vacancy.salaryMax != null) && (
            <span className="tg tg2">
              💰 {vacancy.salaryMin ?? "?"}–{vacancy.salaryMax ?? "?"}
            </span>
          )}
        </div>

        <div
          className="h-px mb-5"
          style={{ background: "rgba(59,130,246,.1)" }}
        />
        <p className="lbl">DESCRIPTION</p>
        <p className="whitespace-pre-wrap text-slate-400 text-sm leading-relaxed">
          {vacancy.description}
        </p>
      </div>

      {token && (
        <div className="uc p-7 au d2">
          <h2 className="font-bold text-slate-100 mb-1">Apply for this role</h2>
          <p className="text-slate-500 text-xs mb-5">
            Upload your CV as a PDF to apply instantly
          </p>
          <form
            onSubmit={handleApply}
            className="flex w-full flex-wrap items-end gap-4"
          >
            <div className="flex-1 space-y-2 min-w-[200px]">
              <label className="lbl">UPLOAD CV (PDF)</label>
              <input
                className="ui"
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <button
              type="submit"
              disabled={!cvFile || applyLoading}
              className="bp px-6 py-2.5 text-sm"
            >
              {applyLoading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white sp" />
                  Sending…
                </>
              ) : (
                "Apply 🚀"
              )}
            </button>
          </form>
        </div>
      )}
      {!token && (
        <div className="uc p-7 text-center au d2">
          <p className="text-slate-500 text-sm mb-4">
            Sign in to apply for this position
          </p>
          <Link href="/auth/sign-in">
            <button className="bp px-6 py-2.5 text-sm">Sign in to apply</button>
          </Link>
        </div>
      )}
    </div>
  );
}
