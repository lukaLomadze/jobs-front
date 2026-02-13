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
import type { Application, Vacancy, Company } from "@/types";

interface AppWithDetails extends Application {
  vacancyId: Vacancy & { companyId?: Company };
}

export default function UserApplicationsPage() {
  const router = useRouter();
  const token = getCookie("token") as string | undefined;
  const [applications, setApplications] = useState<AppWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/auth/sign-in");
      return;
    }
    axiosInstance
      .get("/applications/my")
      .then((res) => setApplications(res.data))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-2xl font-bold">My Applications</h1>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : applications.length === 0 ? (
        <p className="text-muted-foreground">You have not applied to any vacancy yet.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const vacancy = app.vacancyId as Vacancy & { companyId?: Company };
            const companyName =
              vacancy?.companyId && typeof vacancy.companyId === "object"
                ? vacancy.companyId.name
                : "Company";
            return (
              <Card key={app._id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    <Link href={`/vacancies/${vacancy?._id}`} className="hover:underline">
                      {vacancy?.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    {companyName} · Applied{" "}
                    {app.createdAt
                      ? new Date(app.createdAt).toLocaleDateString()
                      : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/vacancies/${vacancy?._id}`}>
                    <Button size="sm" variant="outline">
                      View vacancy
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
