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

  const openCv = async (cvFileUrl: string) => {
    try {
      const res = await axiosInstance.get('/applications/cv-url', {
        params: { fileKey: cvFileUrl },
      });
      window.open(res.data.url, '_blank');
    } catch (err) {
      console.error('Failed to open CV:', err);
    }
  };

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

  if (!token) return null;

  return (
    <div className="container py-8">
      <Link
        href="/company"
        className="text-xs text-slate-500 hover:text-blue-400 mb-6 inline-block"
      >
        ← Back to dashboard
      </Link>
      <div className="mb-7 au">
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          All applications
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Everyone who applied to your postings
        </p>
      </div>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="uc p-5 flex gap-4">
              <div className="sk w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="sk h-4 w-2/5" />
                <div className="sk h-3 w-3/5" />
              </div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="uc p-12 text-center as">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-slate-400 font-semibold">No applications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const user = app.userId as User;
            const vacancy = app.vacancyId as Vacancy;
            return (
              <div
                key={app._id}
                className="uc p-5 flex items-center justify-between gap-4 flex-wrap au"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-violet-300 text-sm"
                    style={{
                      background: "linear-gradient(135deg,#2d1b69,#4c1d95)",
                      border: "1px solid rgba(139,92,246,.2)",
                    }}
                  >
                    {user?.fullName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-100 text-sm">
                      {vacancy?.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user?.fullName} · {user?.email} ·{" "}
                      {app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  CV:{" "}
                  <button
                    onClick={() => openCv(app.cvFileUrl)}
                    className="text-blue-400 hover:underline font-semibold"
                  >
                    Open PDF
                  </button>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
