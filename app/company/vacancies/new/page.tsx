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
      <Link href="/company" className="text-sm text-muted-foreground hover:underline">
        ← Back to dashboard
      </Link>
      <Card className="mt-4 max-w-xl">
        <CardHeader>
          <CardTitle>New vacancy</CardTitle>
          <CardDescription>Vacancy will be pending until admin approves</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} placeholder="Job title" />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                {...register("description")}
                placeholder="Full description"
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" {...register("category")} placeholder="e.g. IT" />
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...register("location")} placeholder="e.g. Tbilisi" />
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location.message}</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">Min salary (optional)</Label>
                <Input id="salaryMin" type="number" {...register("salaryMin")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax">Max salary (optional)</Label>
                <Input id="salaryMax" type="number" {...register("salaryMax")} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create vacancy"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
