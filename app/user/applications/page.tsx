"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCookie } from "cookies-next";
import axiosInstance from "@/lib/axios-instance";
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
      <div className="mb-7 au">
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          My Applications
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Track all your job applications
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="uc p-5 flex gap-4">
              <div className="sk w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="sk h-4 w-3/5" />
                <div className="sk h-3 w-2/5" />
              </div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="uc p-12 text-center as">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-slate-400 font-semibold mb-1">
            No applications yet
          </p>
          <p className="text-slate-600 text-sm mb-5">
            Browse vacancies and apply to get started
          </p>
          <Link href="/">
            <button className="bp px-6 py-2.5 text-sm">Browse Jobs</button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const vacancy = app.vacancyId as Vacancy & { companyId?: Company };
            const companyName =
              vacancy?.companyId && typeof vacancy.companyId === "object"
                ? vacancy.companyId.name
                : "Company";
            return (
              <div
                key={app._id}
                className="uc p-5 flex items-center justify-between gap-4 flex-wrap au"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-blue-400 text-sm"
                    style={{
                      background: "linear-gradient(135deg,#1a2942,#1e3560)",
                      border: "1px solid rgba(59,130,246,.2)",
                    }}
                  >
                    {companyName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <Link
                      href={`/vacancies/${vacancy?._id}`}
                      className="font-bold text-slate-100 text-sm hover:text-blue-400 transition-colors"
                    >
                      {vacancy?.title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {companyName} · Applied{" "}
                      {app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                </div>
                <Link href={`/vacancies/${vacancy?._id}`}>
                  <button className="bg px-4 py-2 text-xs">
                    View Vacancy →
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
