'use client';


import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios-instance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Vacancy } from "@/types";

const TAKE = 12;

function getParam(params: URLSearchParams, key: string): string {
  const v = params.get(key);
  return v ?? "";
}

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);

  const search = getParam(searchParams, "search");
  const category = getParam(searchParams, "category");
  const location = getParam(searchParams, "location");
  const salaryMin = getParam(searchParams, "salaryMin");
  const salaryMax = getParam(searchParams, "salaryMax");
  const page = Math.max(
    1,
    parseInt(getParam(searchParams, "page") || "1", 10) || 1,
  );

  const setParams = useCallback(
    (updates: Record<string, string | number>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === "" || value === undefined) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      router.push(`?${next.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  useEffect(() => {
    const params: Record<string, string | number> = { page, take: TAKE };
    if (search) params.search = search;
    if (category) params.category = category;
    if (location) params.location = location;
    if (salaryMin) params.salaryMin = salaryMin;
    if (salaryMax) params.salaryMax = salaryMax;

    setLoading(true);
    axiosInstance
      .get("/vacancies", { params })
      .then((res) => setVacancies(res.data))
      .catch(() => setVacancies([]))
      .finally(() => setLoading(false));
  }, [search, category, location, salaryMin, salaryMax, page]);

  return (
    <div className="container py-10">
      <div className="text-center mb-10 au">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4 text-xs font-bold tracking-widest"
          style={{
            background: "rgba(59,130,246,.08)",
            borderColor: "rgba(59,130,246,.2)",
            color: "#60a5fa",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          LIVE JOBS
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-100 mb-3">
          Find Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
            Next Role
          </span>
        </h1>
        <p className="text-slate-500 text-sm max-w-xs mx-auto">
          Curated jobs from top companies. Apply in seconds.
        </p>
      </div>

      <div className="uc p-5 mb-7 au d1">
        <p className="lbl mb-3">SEARCH & FILTERS</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            className="ui"
            placeholder="Search…"
            value={search}
            onChange={(e) => setParams({ search: e.target.value, page: 1 })}
          />
          <input
            className="ui"
            placeholder="Category"
            value={category}
            onChange={(e) => setParams({ category: e.target.value, page: 1 })}
          />
          <input
            className="ui"
            placeholder="Location"
            value={location}
            onChange={(e) => setParams({ location: e.target.value, page: 1 })}
          />
          <input
            className="ui"
            type="number"
            placeholder="Min salary"
            value={salaryMin}
            onChange={(e) => setParams({ salaryMin: e.target.value, page: 1 })}
          />
          <input
            className="ui"
            type="number"
            placeholder="Max salary"
            value={salaryMax}
            onChange={(e) => setParams({ salaryMax: e.target.value, page: 1 })}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="uc p-5 space-y-3">
              <div className="flex gap-3">
                <div className="sk w-11 h-11 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="sk h-4 w-3/5" />
                  <div className="sk h-3 w-2/5" />
                </div>
              </div>
              <div className="sk h-3 w-full" />
              <div className="sk h-3 w-4/5" />
              <div className="flex gap-2">
                <div className="sk h-6 w-16 !rounded-full" />
                <div className="sk h-6 w-14 !rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : vacancies.length === 0 ? (
        <div className="uc p-14 text-center as">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-slate-400 font-semibold mb-1">
            No vacancies found
          </p>
          <p className="text-slate-600 text-sm mb-4">Try different filters</p>
          <button
            onClick={() => router.push("/")}
            className="bg px-5 py-2 text-sm"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vacancies.map((v, i) => (
            <div
              key={v._id}
              className={`uc p-5 flex flex-col gap-3 au d${Math.min(i + 1, 4)}`}
            >
              <div className="flex gap-3 items-start">
                <div
                  className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-blue-400 text-base"
                  style={{
                    background: "linear-gradient(135deg,#1a2942,#1e3560)",
                    border: "1px solid rgba(59,130,246,.2)",
                  }}
                >
                  {(typeof v.companyId === "object" && v.companyId?.name
                    ? v.companyId.name
                    : "C")[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/vacancies/${v._id}`}
                    className="font-bold text-slate-100 hover:text-blue-400 transition-colors text-sm line-clamp-1"
                  >
                    {v.title}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {typeof v.companyId === "object" && v.companyId?.name
                      ? v.companyId.name
                      : "Company"}{" "}
                    · {v.location}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {v.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {v.location && <span className="tg tb">📍 {v.location}</span>}
                {v.category && <span className="tg tv">🏷 {v.category}</span>}
                {(v.salaryMin != null || v.salaryMax != null) && (
                  <span className="tg tg2">
                    💰 {v.salaryMin ?? "?"}–{v.salaryMax ?? "?"}
                  </span>
                )}
              </div>
              <Link href={`/vacancies/${v._id}`}>
                <button className="bg px-4 py-2 text-xs self-start">
                  View Job →
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {!loading &&
        vacancies.length > 0 &&
        (page > 1 || vacancies.length === TAKE) && (
          <div className="mt-8 flex justify-center items-center gap-3">
            {page > 1 && (
              <button
                className="bg px-5 py-2 text-sm"
                onClick={() => setParams({ page: page - 1 })}
              >
                ← Prev
              </button>
            )}
            <span
              className="px-4 py-2 rounded-xl text-sm font-bold text-blue-400"
              style={{
                background: "rgba(59,130,246,.1)",
                border: "1px solid rgba(59,130,246,.2)",
              }}
            >
              Page {page}
            </span>
            {vacancies.length === TAKE && (
              <button
                className="bg px-5 py-2 text-sm"
                onClick={() => setParams({ page: page + 1 })}
              >
                Next →
              </button>
            )}
          </div>
        )}
    </div>
  );
}
