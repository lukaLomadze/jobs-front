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
  const [applications, setApplications] = useState<
    (Application & { userId: User })[]
  >([]);
  const [vacancyTitle, setVacancyTitle] = useState("");
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
      .get(`/applications/vacancy/${id}`)
      .then((res) => {
        setApplications(res.data);
        if (res.data[0]?.vacancyId?.title)
          setVacancyTitle(res.data[0].vacancyId.title);
        else setVacancyTitle("Vacancy");
      })
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, [id, token, router]);

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
          Applications for:{" "}
          <span className="text-blue-400">{vacancyTitle}</span>
        </h1>
      </div>
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="uc p-5 flex gap-4">
              <div className="sk w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="sk h-4 w-2/5" />
                <div className="sk h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="uc p-12 text-center as">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-slate-400 font-semibold">
            No applications for this vacancy
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const user = app.userId as User;
            return (
              <div
                key={app._id}
                className="uc p-5 flex items-center justify-between gap-4 flex-wrap au"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-blue-300 text-sm"
                    style={{
                      background: "linear-gradient(135deg,#1a2942,#1e3560)",
                      border: "1px solid rgba(59,130,246,.2)",
                    }}
                  >
                    {user?.fullName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-100 text-sm">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user?.email} · Applied{" "}
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
