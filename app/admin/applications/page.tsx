"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import axiosInstance from "@/lib/axios-instance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Application, Company, User, Vacancy } from "@/types";

interface AppWithPopulated extends Application {
  userId: User;
  vacancyId: Vacancy & { companyId?: Company };
}

export default function AdminApplicationsPage() {
  const router = useRouter();
  const token = getCookie("token") as string | undefined;
  const [applications, setApplications] = useState<AppWithPopulated[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/auth/sign-in");
      return;
    }
    axiosInstance
      .get("/companies", { params: { page: 1, take: 200 } })
      .then((res) => setCompanies(res.data ?? []))
      .catch(() => setCompanies([]));
  }, [token, router]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    const params = companyId ? { companyId } : {};
    axiosInstance
      .get("/applications/admin", { params })
      .then((res) => setApplications(res.data ?? []))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, [token, companyId]);

  if (!token) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          All applications
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View applications globally or filter by company.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Filter by company</CardTitle>
          <CardDescription>Leave empty to see all applications</CardDescription>
        </CardHeader>
        <CardContent>
          <select
            className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
          >
            <option value="">All companies</option>
            {companies.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-muted-foreground">Loading applications...</p>
      ) : applications.length === 0 ? (
        <Card className="border-border/80">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No applications found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const user = app.userId as User;
            const vacancy = app.vacancyId as Vacancy & { companyId?: Company };
            const company = vacancy?.companyId as Company | undefined;
            return (
              <Card
                key={app._id}
                className="overflow-hidden border-border/80 shadow-sm transition-colors hover:bg-muted/20"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{vacancy?.title}</CardTitle>
                  <CardDescription>
                    <span className="font-medium text-foreground">
                      {user?.fullName}
                    </span>{" "}
                    ({user?.email}) ·{" "}
                    {company?.name ?? "Company"} ·{" "}
                    {app.createdAt
                      ? new Date(app.createdAt).toLocaleDateString()
                      : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    CV:{" "}
                    <a
                      href={app.cvFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Open PDF
                    </a>
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
