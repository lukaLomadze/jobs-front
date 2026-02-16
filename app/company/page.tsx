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
import type { Vacancy } from "@/types";

export default function CompanyDashboardPage() {
  const router = useRouter();
  const token = getCookie("token") as string | undefined;
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/auth/sign-in");
      return;
    }
    axiosInstance
      .get("/vacancies/my")
      .then((res) => setVacancies(res.data))
      .catch(() => setVacancies([]))
      .finally(() => setLoading(false));
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Vacancies</h1>
        <Link href="/company/vacancies/new">
          <Button>Add vacancy</Button>
        </Link>
      </div>
      <div className="mb-4">
        <Link
          href="/company/applications"
          className="text-sm text-muted-foreground hover:underline"
        >
          View all applications →
        </Link>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : vacancies.length === 0 ? (
        <p className="text-muted-foreground">
          No vacancies yet. Create one to get started.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vacancies.map((v) => (
            <Card key={v._id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{v.title}</CardTitle>
                <CardDescription>
                  {v.location} · Status:{" "}
                  <span
                    className={
                      v.status === "approved"
                        ? "text-green-600"
                        : v.status === "pending"
                          ? "text-amber-600"
                          : "text-red-600"
                    }
                  >
                    {v.status}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Link href={`/company/vacancies/${v._id}/edit`}>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </Link>
                <Link href={`/company/applications/${v._id}`}>
                  <Button size="sm" variant="outline">
                    Applications
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
