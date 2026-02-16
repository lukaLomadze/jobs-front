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
    <div className="space-y-5">
      <div className="au">
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          All applications
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          View applications globally or filter by company.
        </p>
      </div>

      <div className="uc p-5 au d1">
        <label className="lbl">FILTER BY COMPANY</label>
        <select
          className="ui max-w-xs text-sm"
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
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="uc p-5">
              <div className="sk h-4 w-2/5 mb-2" />
              <div className="sk h-3 w-3/5" />
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="uc p-12 text-center as">
          <p className="text-4xl mb-2">📭</p>
          <p className="text-slate-400 font-semibold">No applications found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const user = app.userId as User;
            const vacancy = app.vacancyId as Vacancy & { companyId?: Company };
            const company = vacancy?.companyId as Company | undefined;
            return (
              <div
                key={app._id}
                className="uc p-5 flex flex-wrap items-center justify-between gap-3 au"
              >
                <div>
                  <p className="font-semibold text-slate-200 text-sm">
                    {vacancy?.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user?.fullName} ({user?.email}) · {company?.name ?? "—"} ·{" "}
                    {app.createdAt
                      ? new Date(app.createdAt).toLocaleDateString()
                      : ""}
                  </p>
                </div>
                <a
                  href={app.cvFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg px-3.5 py-1.5 text-xs"
                >
                  📄 Open PDF
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
