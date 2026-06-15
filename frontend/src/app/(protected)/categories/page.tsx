"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Category } from "@/types";
import { CategoryTable } from "@/components/categories/CategoryTable";
import { CategoryDialog } from "@/components/categories/CategoryDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { redirect } from "next/navigation";

export default function CategoriesPage() {
  const { user } = useAuth();
  if (user?.role !== "Admin") redirect("/dashboard");

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setLoading]     = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]       = useState<Category | null>(null);
  const { toast } = useToast();

  const fetchCategories = useCallback(() => {
    setLoading(true);
    api.get<Category[]>("/categories")
      .then(setCategories)
      .catch(() => toast({ title: "Error", description: "Failed to load categories.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleDelete = async (id: string) => {
    await api.delete(`/categories/${id}`);
    fetchCategories();
    toast({ title: "Deleted", description: "Category deleted." });
  };

  const handleSaved = () => { fetchCategories(); setDialogOpen(false); setEditing(null); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> New Category
        </Button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <CategoryTable
          categories={categories}
          onEdit={(c) => { setEditing(c); setDialogOpen(true); }}
          onDelete={handleDelete}
        />
      )}

      <CategoryDialog
        open={dialogOpen}
        category={editing}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSaved={handleSaved}
      />
    </div>
  );
}
