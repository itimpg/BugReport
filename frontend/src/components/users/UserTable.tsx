"use client";

import type { UserManagement } from "@/types";
import { formatDate } from "@/lib/utils";

interface Props {
  readonly users: UserManagement[];
  readonly onEdit: (user: UserManagement) => void;
}

export function UserTable({ users, onEdit }: Props) {
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
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.id}
              className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
              onClick={() => onEdit(u)}
            >
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">{u.displayName}</p>
                <p className="text-gray-500 text-xs">{u.email}</p>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium border border-blue-100">
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isDisabled ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                  {u.isDisabled ? "Disabled" : "Active"}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
