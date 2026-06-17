"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import type { IssuerGroup } from "@/types";
import { IssuerGroupTable } from "@/components/issuer-groups/IssuerGroupTable";
import { IssuerGroupDialog } from "@/components/issuer-groups/IssuerGroupDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function IssuerGroupsPage() {
  const { user } = useAuth();
  if (user?.role !== "Admin") redirect("/bugs");

  const [groups, setGroups]       = useState<IssuerGroup[]>([]);
  const [isLoading, setLoading]   = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]     = useState<IssuerGroup | null>(null);
  const { toast } = useToast();
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; }, [toast]);

  const fetchGroups = useCallback(() => {
    setLoading(true);
    api.get<IssuerGroup[]>("/issuer-groups")
      .then(setGroups)
      .catch(() => toastRef.current({ title: "Error", description: "Failed to load issuer groups.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const handleDelete = async (id: string) => {
    await api.delete(`/issuer-groups/${id}`);
    fetchGroups();
    toast({ title: "Deleted", description: "Issuer group deleted." });
  };

  const handleSaved = () => { fetchGroups(); setDialogOpen(false); setEditing(null); };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Issuer Groups</h1>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> New Issuer Group
        </Button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <IssuerGroupTable
          groups={groups}
          onEdit={(g) => { setEditing(g); setDialogOpen(true); }}
          onDelete={handleDelete}
        />
      )}

      <IssuerGroupDialog
        open={dialogOpen}
        group={editing}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSaved={handleSaved}
      />
    </div>
  );
}
