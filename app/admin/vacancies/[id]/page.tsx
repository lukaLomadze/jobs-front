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

  if (!token) return null;
  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!vacancy) return <p className="text-muted-foreground">Vacancy not found.</p>;

  const company = typeof vacancy.companyId === "object" ? vacancy.companyId : null;

  return (
    <div className="space-y-6">
      <Link href="/admin" className="text-sm text-muted-foreground hover:underline">
        ← Back to admin
      </Link>
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">{vacancy.title}</CardTitle>
          <CardDescription>
            {vacancy.location} · {vacancy.category}
            {vacancy.salaryMin != null || vacancy.salaryMax != null
              ? ` · ${vacancy.salaryMin ?? "?"} - ${vacancy.salaryMax ?? "?"}`
              : ""}
          </CardDescription>
          {company && (
            <p className="text-sm text-muted-foreground">
              Company: {(company as Company).name}
            </p>
          )}
          <span
            className={`inline-block rounded-md px-2 py-1 text-xs font-medium ${
              vacancy.status === "approved"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
            }`}
          >
            {vacancy.status}
          </span>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground">Description</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
              {vacancy.description}
            </p>
          </div>
          {vacancy.status === "pending" && (
            <div className="flex gap-2 pt-4">
              <Button onClick={approve}>Approve</Button>
              <Button variant="destructive" onClick={reject}>
                Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
