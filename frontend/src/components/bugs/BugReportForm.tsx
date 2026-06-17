"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { BugReport, Category, IssuerGroup } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, Images } from "lucide-react";

const schema = z.object({
  title:       z.string().min(1, "Title is required").max(500),
  description: z.string().min(1, "Description is required"),
  solution:    z.string().optional(),
  incidentDate:z.string().optional(),
  status:      z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props { bug?: BugReport }

/** Convert a UTC ISO string (or now) to a YYYY-MM-DDTHH:MM string in Bangkok time. */
function toBangkokLocal(utcIso?: string): string {
  const ms = utcIso ? new Date(utcIso).getTime() : Date.now();
  return new Date(ms + 7 * 3_600_000).toISOString().slice(0, 16);
}

export function BugReportForm({ bug }: Props) {
  const isEdit = !!bug;
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories]         = useState<Category[]>([]);
  const [selectedCats, setSelectedCats]     = useState<string[]>(bug?.categories.map((c) => c.id) ?? []);
  const [issuerGroups, setIssuerGroups]     = useState<IssuerGroup[]>([]);
  const [issuerGroupId, setIssuerGroupId]   = useState<string>(bug?.issuerGroupId ?? "none");
  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setSubmitting]   = useState(false);
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef  = useRef<HTMLInputElement>(null);

  const handleImageChange = (file: File | undefined) => setImageFile(file ?? null);

  useEffect(() => {
    if (!imageFile) { setImagePreview(null); return; }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title:        bug?.title       ?? "",
      description:  bug?.description ?? "",
      solution:     bug?.solution    ?? "",
      incidentDate: toBangkokLocal(bug?.incidentDate),
      status:       bug?.status      ?? "Open",
    },
  });

  useEffect(() => {
    api.get<Category[]>("/categories").then(setCategories).catch(() => {});
    api.get<IssuerGroup[]>("/issuer-groups").then(setIssuerGroups).catch(() => {});
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
      if (values.incidentDate) form.append("incidentDate", `${values.incidentDate}:00+07:00`);
      if (values.status)       form.append("status",       values.status);
      if (issuerGroupId && issuerGroupId !== "none") form.append("issuerGroupId", issuerGroupId);
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
        <Label htmlFor="solution">Solution</Label>
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
        <Label>Issuer Group</Label>
        <Select value={issuerGroupId} onValueChange={setIssuerGroupId}>
          <SelectTrigger><SelectValue placeholder="Select issuer group" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">— None —</SelectItem>
            {issuerGroups.map((g) => (
              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
        <Label>{isEdit ? "Replace Image" : "Screenshot / Image"}</Label>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => galleryRef.current?.click()}>
            <Images className="mr-1.5 w-4 h-4" /> Gallery
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => cameraRef.current?.click()}>
            <Camera className="mr-1.5 w-4 h-4" /> Camera
          </Button>
        </div>
        {/* Hidden inputs — gallery and camera are separate so capture doesn't block gallery */}
        <input ref={galleryRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => handleImageChange(e.target.files?.[0])} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={(e) => handleImageChange(e.target.files?.[0])} />
        {imageFile && <p className="text-xs text-gray-500 truncate">{imageFile.name}</p>}
        {imagePreview && (
          <img src={imagePreview} alt="New image preview" className="mt-1 max-h-48 rounded-lg object-contain border" />
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}</Button>
        <Button type="button" variant="outline" onClick={() => router.push("/bugs")}>Cancel</Button>
      </div>
    </form>
  );
}
