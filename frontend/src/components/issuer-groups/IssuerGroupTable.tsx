import type { IssuerGroup } from "@/types";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
  groups: IssuerGroup[];
  onEdit: (g: IssuerGroup) => void;
  onDelete: (id: string) => void;
}

export function IssuerGroupTable({ groups, onEdit, onDelete }: Props) {
  if (groups.length === 0)
    return <p className="text-center py-12 text-gray-400">No issuer groups found.</p>;

  return (
    <div className="bg-white rounded-xl border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Created</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr
              key={g.id}
              className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("button")) return;
                onEdit(g);
              }}
            >
              <td className="px-4 py-3 font-medium text-gray-900">{g.name}</td>
              <td className="px-4 py-3 text-gray-500">{formatDate(g.createdAt)}</td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(g)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Delete issuer group "${g.name}"?`)) onDelete(g.id); }}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
