"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { IssuerGroup } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  group: IssuerGroup | null;
  onClose: () => void;
  onSaved: () => void;
}

export function IssuerGroupDialog({ open, group, onClose, onSaved }: Props) {
  const [name, setName]               = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => { setName(group?.name ?? ""); }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      if (group) {
        await api.put(`/issuer-groups/${group.id}`, { name });
        toast({ title: "Updated", description: "Issuer group updated." });
      } else {
        await api.post("/issuer-groups", { name });
        toast({ title: "Created", description: "Issuer group created." });
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
          <DialogTitle>{group ? "Edit Issuer Group" : "New Issuer Group"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="ig-name">Name *</Label>
            <Input id="ig-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Corp" />
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
