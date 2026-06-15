"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Category } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}

export function CategoryDialog({ open, category, onClose, onSaved }: Props) {
  const [name, setName]             = useState("");
  const [description, setDesc]      = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setName(category?.name ?? "");
    setDesc(category?.description ?? "");
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      if (category) {
        await api.put(`/categories/${category.id}`, { name, description: description || null });
        toast({ title: "Updated", description: "Category updated." });
      } else {
        await api.post("/categories", { name, description: description || null });
        toast({ title: "Created", description: "Category created." });
      }
      onSaved();
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "New Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Name *</Label>
            <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. UI, API" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-desc">Description</Label>
            <Input id="cat-desc" value={description} onChange={(e) => setDesc(e.target.value)} placeholder="Optional description" />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="submit" disabled={isSubmitting || !name.trim()}>{isSubmitting ? "Saving..." : "Save"}</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
