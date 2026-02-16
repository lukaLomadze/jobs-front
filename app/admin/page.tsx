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
import type { Application, Company, User, Vacancy } from "@/types";

interface AppWithPopulated extends Application {
  userId: User;
  vacancyId: Vacancy & { companyId?: Company };
}

export default function AdminPage() {
  const router = useRouter();
  const token = getCookie("token") as string | undefined;
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [pendingCompanies, setPendingCompanies] = useState<Company[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [companiesPage, setCompaniesPage] = useState(1);
  const [pendingVacancies, setPendingVacancies] = useState<Vacancy[]>([]);
  const [applications, setApplications] = useState<AppWithPopulated[]>([]);
  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [applicationsCompanyId, setApplicationsCompanyId] =
    useState<string>("");

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);

  const companiesTake = 20;

  // Only check auth and role from current-user (do not set isAdmin to false when data load fails)
  useEffect(() => {
    if (!token) {
      router.push("/auth/sign-in");
      return;
    }
    axiosInstance
      .get("/auth/current-user")
      .then((res) => {
        const role = res.data?.role;
        setIsAdmin(role === "admin");
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setLoadingAuth(false));
  }, [token, router]);

  // Load admin data only when we know user is admin
  useEffect(() => {
    if (!token || isAdmin !== true) return;
    Promise.all([
      axiosInstance.get("/companies/pending"),
      axiosInstance.get("/vacancies/admin/pending"),
      axiosInstance.get("/companies", { params: { page: 1, take: 200 } }),
    ])
      .then(([pendingRes, vacanciesRes, companiesRes]) => {
        setPendingCompanies(pendingRes.data ?? []);
        setPendingVacancies(vacanciesRes.data ?? []);
        setCompanyList(companiesRes.data ?? []);
      })
      .catch(() => {});
  }, [token, isAdmin]);

  // Load all companies (paginated)
  useEffect(() => {
    if (!token || isAdmin !== true) return;
    setLoadingCompanies(true);
    axiosInstance
      .get("/companies", {
        params: { page: companiesPage, take: companiesTake },
      })
      .then((res) => setAllCompanies(res.data ?? []))
      .catch(() => setAllCompanies([]))
      .finally(() => setLoadingCompanies(false));
  }, [token, isAdmin, companiesPage]);

  // Load applications
  useEffect(() => {
    if (!token || isAdmin !== true) return;
    setLoadingApplications(true);
    const params = applicationsCompanyId
      ? { companyId: applicationsCompanyId }
      : {};
    axiosInstance
      .get("/applications/admin", { params })
      .then((res) => setApplications(res.data ?? []))
      .catch(() => setApplications([]))
      .finally(() => setLoadingApplications(false));
  }, [token, isAdmin, applicationsCompanyId]);

  const approveCompany = async (id: string) => {
    try {
      await axiosInstance.patch(`/companies/${id}/approve`);
      setPendingCompanies((prev) => prev.filter((c) => c._id !== id));
      setAllCompanies((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isApproved: true } : c)),
      );
    } catch {}
  };

  const banCompany = async (id: string) => {
    try {
      await axiosInstance.patch(`/companies/${id}/ban`);
      setPendingCompanies((prev) => prev.filter((c) => c._id !== id));
      setAllCompanies((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isApproved: false } : c)),
      );
    } catch {}
  };

  const approveVacancy = async (id: string) => {
    try {
      await axiosInstance.patch(`/vacancies/admin/${id}/approve`);
      setPendingVacancies((prev) => prev.filter((v) => v._id !== id));
    } catch {}
  };

  const rejectVacancy = async (id: string) => {
    try {
      await axiosInstance.patch(`/vacancies/admin/${id}/reject`);
      setPendingVacancies((prev) => prev.filter((v) => v._id !== id));
    } catch {}
  };

  if (!token) return null;
  if (isAdmin === false)
    return (
      <div className="uc p-12 max-w-sm mx-auto text-center as mt-8">
        <p className="text-4xl mb-3">🔒</p>
        <h1 className="text-xl font-bold text-slate-100 mb-1">Access denied</h1>
        <p className="text-slate-500 text-sm mb-5">
          You need admin role to view this page.
        </p>
        <button
          className="bg px-5 py-2 text-sm"
          onClick={() => router.push("/")}
        >
          Back to home
        </button>
      </div>
    );
  if (loadingAuth || isAdmin === null)
    return (
      <div className="flex items-center justify-center py-16 gap-2.5 text-slate-500 text-sm">
        <span className="w-5 h-5 rounded-full border-2 border-blue-500/30 border-t-blue-400 sp" />
        Loading…
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 au">
        {[
          {
            label: "Pending Vacancies",
            val: pendingVacancies.length,
            cls: "text-yellow-400",
          },
          {
            label: "Pending Companies",
            val: pendingCompanies.length,
            cls: "text-red-400",
          },
          {
            label: "All Companies",
            val: allCompanies.length,
            cls: "text-blue-400",
          },
          {
            label: "Applications",
            val: applications.length,
            cls: "text-green-400",
          },
        ].map((s) => (
          <div key={s.label} className="uc p-4" style={{ transition: "none" }}>
            <p className={`text-2xl font-black ${s.cls}`}>{s.val}</p>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="uc overflow-hidden au d1">
        <div
          className="px-5 py-4 border-b flex items-center gap-2.5"
          style={{
            borderColor: "rgba(59,130,246,.1)",
            background: "rgba(59,130,246,.03)",
          }}
        >
          <h2 className="font-bold text-slate-100">
            Vacancies to approve or reject
          </h2>
          {pendingVacancies.length > 0 && (
            <span className="tg tb text-[.65rem]">
              {pendingVacancies.length}
            </span>
          )}
        </div>
        <div className="p-4 space-y-2">
          {pendingVacancies.length === 0 ? (
            <p
              className="py-6 text-center text-sm text-slate-600 border border-dashed rounded-xl"
              style={{ borderColor: "rgba(59,130,246,.12)" }}
            >
              ✓ No pending vacancies
            </p>
          ) : (
            pendingVacancies.map((v) => (
              <div
                key={v._id}
                className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl"
                style={{
                  background: "rgba(26,41,66,.5)",
                  border: "1px solid rgba(59,130,246,.08)",
                }}
              >
                <div>
                  <p className="font-semibold text-slate-200 text-sm">
                    {v.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {v.location} · {v.category}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/vacancies/${v._id}`}>
                    <button className="bg px-3 py-1.5 text-xs">View</button>
                  </Link>
                  <button
                    onClick={() => approveVacancy(v._id)}
                    className="bp px-3 py-1.5 text-xs"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectVacancy(v._id)}
                    className="bd px-3 py-1.5 text-xs"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="uc overflow-hidden au d2">
        <div
          className="px-5 py-4 border-b flex items-center gap-2.5"
          style={{
            borderColor: "rgba(59,130,246,.1)",
            background: "rgba(59,130,246,.03)",
          }}
        >
          <h2 className="font-bold text-slate-100">Pending companies</h2>
          {pendingCompanies.length > 0 && (
            <span className="tg tr text-[.65rem]">
              {pendingCompanies.length}
            </span>
          )}
        </div>
        <div className="p-4 space-y-2">
          {pendingCompanies.length === 0 ? (
            <p
              className="py-6 text-center text-sm text-slate-600 border border-dashed rounded-xl"
              style={{ borderColor: "rgba(59,130,246,.12)" }}
            >
              ✓ No pending companies
            </p>
          ) : (
            pendingCompanies.map((c) => (
              <div
                key={c._id}
                className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl"
                style={{
                  background: "rgba(26,41,66,.5)",
                  border: "1px solid rgba(59,130,246,.08)",
                }}
              >
                <div>
                  <p className="font-semibold text-slate-200 text-sm">
                    {c.name}
                  </p>
                  <p className="text-xs text-slate-500">{c.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveCompany(c._id)}
                    className="bp px-3 py-1.5 text-xs"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => banCompany(c._id)}
                    className="bd px-3 py-1.5 text-xs"
                  >
                    Ban
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="uc overflow-hidden au d3">
        <div
          className="px-5 py-4 border-b"
          style={{
            borderColor: "rgba(59,130,246,.1)",
            background: "rgba(59,130,246,.03)",
          }}
        >
          <h2 className="font-bold text-slate-100">All companies</h2>
        </div>
        <div className="p-4">
          {loadingCompanies ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="sk h-14" />
              ))}
            </div>
          ) : allCompanies.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-600">
              No companies
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {allCompanies.map((c) => (
                  <div
                    key={c._id}
                    className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl"
                    style={{
                      background: "rgba(26,41,66,.4)",
                      border: "1px solid rgba(59,130,246,.07)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-blue-400 text-sm"
                        style={{
                          background: "linear-gradient(135deg,#1a2942,#1e3560)",
                          border: "1px solid rgba(59,130,246,.2)",
                        }}
                      >
                        {c.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200 text-sm">
                          {c.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {c.email}{" "}
                          <span
                            className={`ml-1 tg text-[.62rem] ${c.isApproved ? "tg2" : "ty"}`}
                          >
                            {c.isApproved ? "✓ Live" : "⏳ Pending"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!c.isApproved && (
                        <button
                          onClick={() => approveCompany(c._id)}
                          className="bp px-3 py-1.5 text-xs"
                        >
                          Approve
                        </button>
                      )}
                      {c.isApproved && (
                        <button
                          onClick={() => banCompany(c._id)}
                          className="bd px-3 py-1.5 text-xs"
                        >
                          Ban
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="flex justify-center gap-2 mt-4 pt-4 border-t"
                style={{ borderColor: "rgba(59,130,246,.08)" }}
              >
                <button
                  className="bg px-4 py-1.5 text-xs"
                  disabled={companiesPage <= 1}
                  onClick={() => setCompaniesPage((p) => Math.max(1, p - 1))}
                >
                  ← Previous
                </button>
                <span className="px-3 py-1.5 text-xs text-slate-500">
                  Page {companiesPage}
                </span>
                <button
                  className="bg px-4 py-1.5 text-xs"
                  disabled={allCompanies.length < companiesTake}
                  onClick={() => setCompaniesPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="uc overflow-hidden au d4">
        <div
          className="px-5 py-4 border-b"
          style={{
            borderColor: "rgba(59,130,246,.1)",
            background: "rgba(59,130,246,.03)",
          }}
        >
          <h2 className="font-bold text-slate-100">All applications</h2>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <label className="lbl">FILTER BY COMPANY</label>
            <select
              className="ui max-w-xs text-sm"
              value={applicationsCompanyId}
              onChange={(e) => setApplicationsCompanyId(e.target.value)}
            >
              <option value="">All companies</option>
              {companyList.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {loadingApplications ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="sk h-16" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <p
              className="py-6 text-center text-sm text-slate-600 border border-dashed rounded-xl"
              style={{ borderColor: "rgba(59,130,246,.12)" }}
            >
              No applications found
            </p>
          ) : (
            <div className="space-y-2">
              {applications.map((app) => {
                const user = app.userId as User;
                const vacancy = app.vacancyId as Vacancy & {
                  companyId?: Company;
                };
                const company = vacancy?.companyId as Company | undefined;
                return (
                  <div
                    key={app._id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl"
                    style={{
                      background: "rgba(26,41,66,.4)",
                      border: "1px solid rgba(59,130,246,.07)",
                    }}
                  >
                    <div>
                      <p className="font-semibold text-slate-200 text-sm">
                        {vacancy?.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {user?.fullName} · {user?.email} ·{" "}
                        {company?.name ?? "—"} ·{" "}
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
                      📄 CV
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
