"use client";

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
  const page = Math.max(1, parseInt(getParam(searchParams, "page") || "1", 10) || 1);

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
    <div className="container py-8">
      <h1 className="mb-6 text-2xl font-bold">Vacancies</h1>

      {/* Search & filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>Filter by keyword, category, location, salary</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setParams({ search: e.target.value, page: 1 })}
          />
          <Input
            placeholder="Category"
            value={category}
            onChange={(e) => setParams({ category: e.target.value, page: 1 })}
          />
          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => setParams({ location: e.target.value, page: 1 })}
          />
          <Input
            type="number"
            placeholder="Min salary"
            value={salaryMin}
            onChange={(e) => setParams({ salaryMin: e.target.value, page: 1 })}
          />
          <Input
            type="number"
            placeholder="Max salary"
            value={salaryMax}
            onChange={(e) => setParams({ salaryMax: e.target.value, page: 1 })}
          />
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-muted-foreground">Loading vacancies...</p>
      ) : vacancies.length === 0 ? (
        <p className="text-muted-foreground">No vacancies found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vacancies.map((v) => (
            <Card key={v._id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  <Link href={`/vacancies/${v._id}`} className="hover:underline">
                    {v.title}
                  </Link>
                </CardTitle>
                <CardDescription>
                  {typeof v.companyId === "object" && v.companyId?.name
                    ? v.companyId.name
                    : "Company"}
                  {" · "}
                  {v.location}
                  {v.salaryMin != null || v.salaryMax != null
                    ? ` · ${v.salaryMin ?? "?"} - ${v.salaryMax ?? "?"}`
                    : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {v.description}
                </p>
              </CardContent>
              <CardFooter>
                <Link href={`/vacancies/${v._id}`}>
                  <Button size="sm">View</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!loading && vacancies.length > 0 && (page > 1 || vacancies.length === TAKE) && (
        <div className="mt-6 flex justify-center items-center gap-2">
          {page > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setParams({ page: page - 1 })}
            >
              Previous
            </Button>
          )}
          <span className="px-4 text-sm">Page {page}</span>
          {vacancies.length === TAKE && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setParams({ page: page + 1 })}
            >
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
