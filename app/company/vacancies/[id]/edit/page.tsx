"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function EditVacancyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const token = getCookie("token") as string | undefined;
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!token) {
      router.push("/auth/sign-in");
      return;
    }
    axiosInstance
      .get("/vacancies/my")
      .then((res) => {
        const v = res.data.find((vac: { _id: string }) => vac._id === id);
        if (!v) {
          router.push("/company");
          return;
        }
        reset({
          title: v.title,
          description: v.description,
          category: v.category,
          location: v.location,
          salaryMin: v.salaryMin,
          salaryMax: v.salaryMax,
        });
      })
      .catch(() => router.push("/company"));
  }, [id, token, router, reset]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await axiosInstance.patch(`/vacancies/${id}`, data);
      toast.success("Vacancy updated");
      router.push("/company");
      router.refresh();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this vacancy?")) return;
    try {
      await axiosInstance.delete(`/vacancies/${id}`);
      toast.success("Vacancy deleted");
      router.push("/company");
      router.refresh();
    } catch {
      toast.error("Failed to delete");
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
          <CardTitle>Edit vacancy</CardTitle>
          <CardDescription>Update the vacancy details</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} />
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
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" {...register("category")} />
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...register("location")} />
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location.message}</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">Min salary</Label>
                <Input id="salaryMin" type="number" {...register("salaryMin")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax">Max salary</Label>
                <Input id="salaryMax" type="number" {...register("salaryMax")} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
