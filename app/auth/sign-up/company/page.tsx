"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  companyName: z.string().min(1),
  description: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  fullName: z.string().min(1),
  password: z.string().min(6).max(20),
});

type FormData = z.infer<typeof schema>;

export default function SignUpCompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { website: "" },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await axiosInstance.post("/auth/sign-up/company", {
        ...data,
        website: data.website || undefined,
      });
      toast.success("Company registered. Awaiting admin approval.");
      router.push("/auth/sign-in");
      router.refresh();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-8">
      <div className="w-full max-w-md as">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Register your company
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Reviewed by admin before you can post jobs
          </p>
        </div>
        <div className="uc p-7">
          <div
            className="flex items-center gap-2.5 p-3.5 rounded-xl mb-5"
            style={{
              background: "rgba(234,179,8,.07)",
              border: "1px solid rgba(234,179,8,.2)",
            }}
          >
            <span className="text-yellow-400">⚠️</span>
            <p className="text-yellow-400 text-xs font-semibold">
              Admin approval required before posting jobs
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="lbl">COMPANY NAME</label>
              <input
                className="ui"
                id="companyName"
                placeholder="Acme Inc"
                {...register("companyName")}
              />
              {errors.companyName && (
                <p className="err">⚠ {errors.companyName.message}</p>
              )}
            </div>
            <div>
              <label className="lbl">DESCRIPTION (optional)</label>
              <input
                className="ui"
                id="description"
                placeholder="What we do"
                {...register("description")}
              />
            </div>
            <div>
              <label className="lbl">COMPANY EMAIL</label>
              <input
                className="ui"
                id="email"
                type="email"
                placeholder="contact@acme.com"
                {...register("email")}
              />
              {errors.email && <p className="err">⚠ {errors.email.message}</p>}
            </div>
            <div>
              <label className="lbl">PHONE (optional)</label>
              <input
                className="ui"
                id="phone"
                placeholder="+995…"
                {...register("phone")}
              />
            </div>
            <div>
              <label className="lbl">WEBSITE (optional)</label>
              <input
                className="ui"
                id="website"
                placeholder="https://…"
                {...register("website")}
              />
              {errors.website && (
                <p className="err">⚠ {errors.website.message}</p>
              )}
            </div>
            <div>
              <label className="lbl">YOUR FULL NAME</label>
              <input
                className="ui"
                id="fullName"
                placeholder="John Doe"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="err">⚠ {errors.fullName.message}</p>
              )}
            </div>
            <div>
              <label className="lbl">PASSWORD</label>
              <input
                className="ui"
                id="password"
                type="password"
                placeholder="Min 6 characters"
                {...register("password")}
              />
              {errors.password && (
                <p className="err">⚠ {errors.password.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bp w-full py-3 text-sm mt-1"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white sp" />
                  Registering…
                </>
              ) : (
                "Register company →"
              )}
            </button>
          </form>
          <Link
            href="/auth/sign-up"
            className="block text-center text-xs text-slate-600 hover:text-slate-400 mt-4"
          >
            ← Back to options
          </Link>
        </div>
      </div>
    </div>
  );
}
