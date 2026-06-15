"use client";

import { useState } from "react";
import type { UserManagement } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  user: UserManagement | null;
  onClose: () => void;
  onRoleChange: (id: string, role: string) => Promise<void>;
  onDisable: (id: string, isDisabled: boolean) => Promise<void>;
}

export function UserEditDialog({ user, onClose, onRoleChange, onDisable }: Props) {
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleRoleChange = async (role: string) => {
    setSaving(true);
    await onRoleChange(user.id, role);
    setSaving(false);
  };

  const handleToggleDisable = async () => {
    setSaving(true);
    await onDisable(user.id, !user.isDisabled);
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={!!user} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select defaultValue={user.role} onValueChange={handleRoleChange} disabled={saving}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.isDisabled ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {user.isDisabled ? "Disabled" : "Active"}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={handleToggleDisable}
              >
                {user.isDisabled ? "Enable account" : "Disable account"}
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
