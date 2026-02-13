"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function VacancyApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const token = getCookie("token") as string | undefined;
  const [applications, setApplications] = useState<(Application & { userId: User })[]>([]);
  const [vacancyTitle, setVacancyTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/auth/sign-in");
      return;
    }
    axiosInstance
      .get(`/applications/vacancy/${id}`)
      .then((res) => {
        setApplications(res.data);
        if (res.data[0]?.vacancyId?.title) setVacancyTitle(res.data[0].vacancyId.title);
        else setVacancyTitle("Vacancy");
      })
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, [id, token, router]);

  if (!token) return null;

  return (
    <div className="container py-8">
      <Link href="/company" className="text-sm text-muted-foreground hover:underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-bold">Applications for: {vacancyTitle}</h1>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : applications.length === 0 ? (
        <p className="text-muted-foreground">No applications for this vacancy.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const user = app.userId as User;
            return (
              <Card key={app._id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{user?.fullName}</CardTitle>
                  <CardDescription>
                    {user?.email} · Applied{" "}
                    {app.createdAt
                      ? new Date(app.createdAt).toLocaleDateString()
                      : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    CV: {app.cvFileUrl}
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
