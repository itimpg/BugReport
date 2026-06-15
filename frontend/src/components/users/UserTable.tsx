"use client";

import type { UserManagement } from "@/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { Ban, CheckCircle } from "lucide-react";

interface Props {
  users: UserManagement[];
  onRoleChange: (id: string, role: string) => void;
  onDisable: (id: string, isDisabled: boolean) => void;
}

export function UserTable({ users, onRoleChange, onDisable }: Props) {
  if (users.length === 0)
    return <p className="text-center py-12 text-gray-400">No users found.</p>;

  return (
    <div className="bg-white rounded-xl border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">{u.displayName}</p>
                <p className="text-gray-500 text-xs">{u.email}</p>
              </td>
              <td className="px-4 py-3">
                <Select defaultValue={u.role} onValueChange={(v) => onRoleChange(u.id, v)}>
                  <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isDisabled ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                  {u.isDisabled ? "Disabled" : "Active"}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
              <td className="px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  title={u.isDisabled ? "Enable" : "Disable"}
                  onClick={() => onDisable(u.id, !u.isDisabled)}
                >
                  {u.isDisabled ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Ban className="w-4 h-4 text-red-500" />}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
