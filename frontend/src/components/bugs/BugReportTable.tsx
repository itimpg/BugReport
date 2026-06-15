"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BugReport } from "@/types";
import { StatusBadge } from "@/components/bugs/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ImageOff, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  bugs: BugReport[];
  onDelete: (id: string) => void;
}

export function BugReportTable({ bugs, onDelete }: Props) {
  const { user } = useAuth();
  const router = useRouter();

  if (bugs.length === 0)
    return <p className="text-center py-12 text-gray-400">No bug reports found.</p>;

  return (
    <div className="bg-white rounded-xl border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-3 py-3 w-14" />
            <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Categories</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Reporter</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {bugs.map((b) => {
            const canEdit   = user?.role === "Admin" || user?.id === b.reportedBy;
            const canDelete = user?.role === "Admin";
            return (
              <tr
                key={b.id}
                className={`border-b last:border-0 hover:bg-gray-50 ${canEdit ? "cursor-pointer" : ""}`}
                onClick={(e) => {
                  // Don't navigate if clicking the action buttons
                  if ((e.target as HTMLElement).closest("button, a")) return;
                  if (canEdit) router.push(`/bugs/${b.id}/edit`);
                }}
              >
                <td className="px-3 py-2">
                  {b.imageUrl ? (
                    <img
                      src={b.imageUrl}
                      alt="screenshot"
                      className="w-10 h-10 rounded object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 flex items-center justify-center">
                      <ImageOff className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{b.title}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {b.categories.map((c) => (
                      <span key={c.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">{c.name}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-4 py-3 text-gray-600">{b.reporterName}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(b.createdAt)}</td>
                <td className="px-4 py-3">
                  {(canEdit || canDelete) && (
                    <div className="flex gap-1">
                      {canEdit && (
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/bugs/${b.id}/edit`}><Pencil className="w-4 h-4" /></Link>
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="ghost" size="icon" onClick={() => onDelete(b.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
