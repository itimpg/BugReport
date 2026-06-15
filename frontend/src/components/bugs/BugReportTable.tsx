"use client";

import Link from "next/link";
import type { BugReport } from "@/types";
import { StatusBadge } from "@/components/bugs/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  bugs: BugReport[];
  onDelete: (id: string) => void;
}

export function BugReportTable({ bugs, onDelete }: Props) {
  const { user } = useAuth();

  if (bugs.length === 0)
    return <p className="text-center py-12 text-gray-400">No bug reports found.</p>;

  return (
    <div className="bg-white rounded-xl border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Categories</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Reporter</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {bugs.map((b) => (
            <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50">
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
                {(user?.role === "Admin" || user?.id === b.reportedBy) && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/bugs/${b.id}/edit`}><Pencil className="w-4 h-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(b.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
