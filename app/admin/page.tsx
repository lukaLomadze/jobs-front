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
  const [applicationsCompanyId, setApplicationsCompanyId] = useState<string>("");

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
      .get("/companies", { params: { page: companiesPage, take: companiesTake } })
      .then((res) => setAllCompanies(res.data ?? []))
      .catch(() => setAllCompanies([]))
      .finally(() => setLoadingCompanies(false));
  }, [token, isAdmin, companiesPage]);

  // Load applications
  useEffect(() => {
    if (!token || isAdmin !== true) return;
    setLoadingApplications(true);
    const params = applicationsCompanyId ? { companyId: applicationsCompanyId } : {};
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
        prev.map((c) => (c._id === id ? { ...c, isApproved: true } : c))
      );
    } catch {}
  };

  const banCompany = async (id: string) => {
    try {
      await axiosInstance.patch(`/companies/${id}/ban`);
      setPendingCompanies((prev) => prev.filter((c) => c._id !== id));
      setAllCompanies((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isApproved: false } : c))
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

  if (isAdmin === false) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You need admin role to view this page.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => router.push("/")}>
          Back to home
        </Button>
      </div>
    );
  }

  if (loadingAuth || (isAdmin === null)) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Admin
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review vacancies, companies, and applications.
        </p>
      </div>

      {/* Vacancies to approve or reject — first and main section */}
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="bg-muted/40">
          <CardTitle className="text-lg">Vacancies to approve or reject</CardTitle>
          <CardDescription>
            View details, then approve or reject each posting
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {pendingVacancies.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/80 py-6 text-center text-sm text-muted-foreground">
              No pending vacancies.
            </p>
          ) : (
            <ul className="space-y-3">
              {pendingVacancies.map((v) => (
                <li
                  key={v._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/80 bg-card p-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{v.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {v.location} · {v.category}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link href={`/admin/vacancies/${v._id}`}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                    <Button size="sm" onClick={() => approveVacancy(v._id)}>
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => rejectVacancy(v._id)}>
                      Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Pending companies */}
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="bg-muted/40">
          <CardTitle className="text-lg">Pending companies</CardTitle>
          <CardDescription>New registrations — approve or ban</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {pendingCompanies.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/80 py-6 text-center text-sm text-muted-foreground">
              No pending companies.
            </p>
          ) : (
            <ul className="space-y-3">
              {pendingCompanies.map((c) => (
                <li
                  key={c._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/80 bg-card p-4"
                >
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => approveCompany(c._id)}>
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => banCompany(c._id)}>
                      Ban
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* All companies */}
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="bg-muted/40">
          <CardTitle className="text-lg">All companies</CardTitle>
          <CardDescription>Approve or ban any company</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {loadingCompanies ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p>
          ) : allCompanies.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/80 py-6 text-center text-sm text-muted-foreground">
              No companies.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-border/80">
                {allCompanies.map((c) => (
                  <li
                    key={c._id}
                    className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0"
                  >
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {c.email}
                        <span
                          className={
                            c.isApproved
                              ? "ml-2 text-green-600 dark:text-green-400"
                              : "ml-2 text-amber-600 dark:text-amber-400"
                          }
                        >
                          · {c.isApproved ? "Approved" : "Not approved"}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!c.isApproved && (
                        <Button size="sm" onClick={() => approveCompany(c._id)}>
                          Approve
                        </Button>
                      )}
                      {c.isApproved && (
                        <Button size="sm" variant="destructive" onClick={() => banCompany(c._id)}>
                          Ban
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-center gap-2 border-t border-border/80 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={companiesPage <= 1}
                  onClick={() => setCompaniesPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {companiesPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={allCompanies.length < companiesTake}
                  onClick={() => setCompaniesPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* All applications */}
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="bg-muted/40">
          <CardTitle className="text-lg">All applications</CardTitle>
          <CardDescription>Filter by company below</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Filter by company
            </label>
            <select
              className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
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
            <p className="py-6 text-center text-sm text-muted-foreground">
              Loading applications...
            </p>
          ) : applications.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/80 py-6 text-center text-sm text-muted-foreground">
              No applications found.
            </p>
          ) : (
            <ul className="space-y-3">
              {applications.map((app) => {
                const user = app.userId as User;
                const vacancy = app.vacancyId as Vacancy & { companyId?: Company };
                const company = vacancy?.companyId as Company | undefined;
                return (
                  <li
                    key={app._id}
                    className="rounded-lg border border-border/80 bg-card p-4"
                  >
                    <p className="font-medium">{vacancy?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.fullName} ({user?.email}) · {company?.name ?? "—"} ·{" "}
                      {app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString()
                        : ""}
                    </p>
                    <p className="mt-1 text-sm">
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
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
