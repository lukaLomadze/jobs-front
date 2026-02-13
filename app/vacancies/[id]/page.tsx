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

  if (loading) return <div className="container py-8">Loading...</div>;
  if (!vacancy) return <div className="container py-8">Vacancy not found.</div>;

  const companyName =
    typeof vacancy.companyId === "object" && vacancy.companyId?.name
      ? vacancy.companyId.name
      : "Company";

  return (
    <div className="container py-8">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Back to vacancies
      </Link>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-2xl">{vacancy.title}</CardTitle>
          <CardDescription>
            {companyName} · {vacancy.location}
            {vacancy.category ? ` · ${vacancy.category}` : ""}
            {(vacancy.salaryMin != null || vacancy.salaryMax != null) && (
              <> · Salary: {vacancy.salaryMin ?? "?"} - {vacancy.salaryMax ?? "?"}</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-muted-foreground">
            {vacancy.description}
          </p>
        </CardContent>
        {token && (
          <CardFooter>
            <form onSubmit={handleApply} className="flex w-full flex-wrap items-end gap-4">
              <div className="flex-1 space-y-2 min-w-[200px]">
                <label className="text-sm font-medium">Upload CV (PDF)</label>
                <Input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <Button type="submit" disabled={!cvFile || applyLoading}>
                {applyLoading ? "Sending..." : "Apply"}
              </Button>
            </form>
          </CardFooter>
        )}
        {!token && (
          <CardFooter>
            <Link href="/auth/sign-in">
              <Button>Sign in to apply</Button>
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
