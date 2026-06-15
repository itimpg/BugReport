import type { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
  categories: Category[];
  onEdit: (c: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryTable({ categories, onEdit, onDelete }: Props) {
  if (categories.length === 0)
    return <p className="text-center py-12 text-gray-400">No categories found.</p>;

  return (
    <div className="bg-white rounded-xl border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Created</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
              <td className="px-4 py-3 text-gray-600">{c.description ?? "—"}</td>
              <td className="px-4 py-3 text-gray-500">{formatDate(c.createdAt)}</td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(c)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Delete category "${c.name}"?`)) onDelete(c.id); }}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
