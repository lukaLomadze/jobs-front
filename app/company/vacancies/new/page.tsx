"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCookie } from "cookies-next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios-instance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const schema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  location: z.string().min(1),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewVacancyPage() {
  const router = useRouter();
  const token = getCookie("token") as string | undefined;
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      router.push("/auth/sign-in");
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post("/vacancies", data);
      toast.success("Vacancy created. It will be reviewed by admin.");
      router.push("/company");
      router.refresh();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? "Failed to create vacancy");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="container py-8">
      <Link
        href="/company"
        className="text-xs text-slate-500 hover:text-blue-400 transition-colors mb-6 inline-block"
      >
        ← Back to dashboard
      </Link>
      <div className="uc mt-4 max-w-xl p-7 au">
        <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mb-1">
          New vacancy
        </h1>
        <p className="text-slate-500 text-xs mb-6">
          Vacancy will be pending until admin approves
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="lbl">JOB TITLE *</label>
            <input
              className="ui"
              id="title"
              placeholder="Job title"
              {...register("title")}
            />
            {errors.title && <p className="err">⚠ {errors.title.message}</p>}
          </div>
          <div>
            <label className="lbl">DESCRIPTION *</label>
            <textarea
              id="description"
              className="ui min-h-[120px] resize-y"
              placeholder="Full description"
              {...register("description")}
            />
            {errors.description && (
              <p className="err">⚠ {errors.description.message}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="lbl">CATEGORY *</label>
              <input
                className="ui"
                id="category"
                placeholder="e.g. IT"
                {...register("category")}
              />
              {errors.category && (
                <p className="err">⚠ {errors.category.message}</p>
              )}
            </div>
            <div>
              <label className="lbl">LOCATION *</label>
              <input
                className="ui"
                id="location"
                placeholder="e.g. Tbilisi"
                {...register("location")}
              />
              {errors.location && (
                <p className="err">⚠ {errors.location.message}</p>
              )}
            </div>
          </div>
          <div>
            <label className="lbl">SALARY RANGE (optional)</label>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className="ui"
                id="salaryMin"
                type="number"
                placeholder="Min"
                {...register("salaryMin")}
              />
              <input
                className="ui"
                id="salaryMax"
                type="number"
                placeholder="Max"
                {...register("salaryMax")}
              />
            </div>
          </div>
          <div className="h-px" style={{ background: "rgba(59,130,246,.1)" }} />
          <button
            type="submit"
            disabled={loading}
            className="bp w-full py-3 text-sm"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white sp" />
                Creating…
              </>
            ) : (
              "Create vacancy →"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
