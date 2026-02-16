"use client";

import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-8">
      <div className="w-full max-w-md as">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Create an account
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Choose how you want to register
          </p>
        </div>
        <div className="uc p-6 space-y-3">
          <Link
            href="/auth/sign-up/user"
            className="flex items-center gap-4 p-4 rounded-xl transition-colors group"
            style={{
              background: "rgba(59,130,246,.06)",
              border: "1px solid rgba(59,130,246,.15)",
            }}
          >
            <span className="text-2xl">👤</span>
            <div className="flex-1">
              <p className="font-bold text-slate-100 text-sm">Job Seeker</p>
              <p className="text-xs text-slate-500">Find and apply to jobs</p>
            </div>
            <span className="text-blue-400 text-xs font-semibold group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
          <Link
            href="/auth/sign-up/company"
            className="flex items-center gap-4 p-4 rounded-xl transition-colors group"
            style={{
              background: "rgba(139,92,246,.06)",
              border: "1px solid rgba(139,92,246,.15)",
            }}
          >
            <span className="text-2xl">🏢</span>
            <div className="flex-1">
              <p className="font-bold text-slate-100 text-sm">Company</p>
              <p className="text-xs text-slate-500">
                Post jobs and hire talent
              </p>
            </div>
            <span className="text-violet-400 text-xs font-semibold group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
          <p className="text-center text-xs text-slate-600 pt-1">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="text-blue-400 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
