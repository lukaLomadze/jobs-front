"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { setCookie } from "cookies-next";
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

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type SignInForm = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInForm) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/sign-in", data);
      setCookie("token", res.data.token, { maxAge: 60 * 60 * 24 * 7 });
      toast.success("Signed in successfully");
      router.push("/");
      router.refresh();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-8">
      <div className="w-full max-w-sm as">
        <div className="text-center mb-7">
          <div
            className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center text-2xl af"
            style={{
              background: "linear-gradient(135deg,#1a2942,#1e3560)",
              border: "1px solid rgba(59,130,246,.25)",
              boxShadow: "0 8px 24px rgba(59,130,246,.15)",
            }}
          >
            🔐
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Welcome back
          </h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to continue</p>
        </div>

        <div className="uc p-7 space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-slate-200 text-sm font-semibold transition-colors"
            style={{
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.1)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.075 17.64 11.768 17.64 9.2z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(59,130,246,.1)" }}
            />
            <span className="text-xs text-slate-600 font-medium">or email</span>
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(59,130,246,.1)" }}
            />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="lbl">EMAIL</label>
              <input
                className="ui"
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && <p className="err">⚠ {errors.email.message}</p>}
            </div>
            <div>
              <label className="lbl">PASSWORD</label>
              <input
                className="ui"
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="err">⚠ {errors.password.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bp w-full py-3 text-sm"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white sp" />
                  Signing in…
                </>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600">
            Don't have an account?{" "}
            <Link href="/auth/sign-up" className="text-blue-400 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
