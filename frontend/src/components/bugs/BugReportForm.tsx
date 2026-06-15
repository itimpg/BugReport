"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { BugReport, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const schema = z.object({
  title:       z.string().min(1, "Title is required").max(500),
  description: z.string().min(1, "Description is required"),
  solution:    z.string().optional(),
  incidentDate:z.string().optional(),
  status:      z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props { bug?: BugReport }

export function BugReportForm({ bug }: Props) {
  const isEdit = !!bug;
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories]     = useState<Category[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>(bug?.categories.map((c) => c.id) ?? []);
  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [isSubmitting, setSubmitting]   = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title:        bug?.title       ?? "",
      description:  bug?.description ?? "",
      solution:     bug?.solution    ?? "",
      incidentDate: bug?.incidentDate ? bug.incidentDate.slice(0, 16) : new Date().toISOString().slice(0, 16),
      status:       bug?.status      ?? "Open",
    },
  });

  useEffect(() => {
    api.get<Category[]>("/categories").then(setCategories).catch(() => {});
  }, []);

  const toggleCat = (id: string) =>
    setSelectedCats((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("title",        values.title);
      form.append("description",  values.description);
      if (values.solution)     form.append("solution",     values.solution);
      if (values.incidentDate) form.append("incidentDate", values.incidentDate);
      if (values.status)       form.append("status",       values.status);
      selectedCats.forEach((id) => form.append("categoryIds", id));
      if (imageFile) form.append("image", imageFile);

      if (isEdit) {
        await api.put(`/bugs/${bug!.id}`, form);
        toast({ title: "Updated", description: "Bug report updated successfully." });
      } else {
        await api.post("/bugs", form);
        toast({ title: "Created", description: "Bug report created successfully." });
      }
      router.push("/bugs");
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border p-6 space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" {...register("title")} placeholder="Brief summary of the bug" />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description *</Label>
        <textarea
          id="description"
          {...register("description")}
          rows={4}
          placeholder="Steps to reproduce, expected vs actual behavior..."
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="solution">How to Solve</Label>
        <textarea
          id="solution"
          {...register("solution")}
          rows={3}
          placeholder="Steps or notes on how to resolve this bug..."
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="incidentDate">Incident Date</Label>
        <Input id="incidentDate" type="datetime-local" {...register("incidentDate")} />
      </div>

      {(isEdit && user?.role === "Admin") && (
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select defaultValue={bug?.status} onValueChange={(v) => setValue("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Open","InProgress","Resolved","Closed"].map((s) => (
                <SelectItem key={s} value={s}>{s === "InProgress" ? "In Progress" : s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Categories</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleCat(c.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedCats.includes(c.id)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="image">Screenshot / Image</Label>
        <Input id="image" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
        {bug?.imageUrl && <p className="text-xs text-gray-500">Current image: <a href={bug.imageUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline">view</a></p>}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}</Button>
        <Button type="button" variant="outline" onClick={() => router.push("/bugs")}>Cancel</Button>
      </div>
    </form>
  );
}
