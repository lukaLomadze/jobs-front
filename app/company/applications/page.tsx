"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCookie } from "cookies-next";
import axiosInstance from "@/lib/axios-instance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Application, User, Vacancy } from "@/types";

interface AppWithUser extends Application {
  userId: User;
  vacancyId: Vacancy;
}

export default function CompanyApplicationsPage() {
  const router = useRouter();
  const token = getCookie("token") as string | undefined;
  const [applications, setApplications] = useState<AppWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/auth/sign-in");
      return;
    }
    axiosInstance
      .get("/applications/company")
      .then((res) => setApplications(res.data))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="container py-8">
      <Link href="/company" className="text-sm text-muted-foreground hover:underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-bold">All applications</h1>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : applications.length === 0 ? (
        <p className="text-muted-foreground">No applications yet.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const user = app.userId as User;
            const vacancy = app.vacancyId as Vacancy;
            return (
              <Card key={app._id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{vacancy?.title}</CardTitle>
                  <CardDescription>
                    Applicant: {user?.fullName} ({user?.email}) ·{" "}
                    {app.createdAt
                      ? new Date(app.createdAt).toLocaleDateString()
                      : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    CV stored (file key: {app.cvFileUrl})
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
