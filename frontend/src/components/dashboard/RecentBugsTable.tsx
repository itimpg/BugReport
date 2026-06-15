import Link from "next/link";
import { StatusBadge } from "@/components/bugs/StatusBadge";
import { formatDate } from "@/lib/utils";

interface Props {
  bugs: { id: string; title: string; status: string; createdAt: string; reporterName: string }[];
}

export function RecentBugsTable({ bugs }: Props) {
  return (
    <div className="bg-white rounded-xl border">
      <div className="p-5 border-b"><h3 className="font-semibold text-gray-900">Recent Bug Reports</h3></div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-5 py-3 font-medium text-gray-600">Title</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Reporter</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {bugs.map((b) => (
              <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3">
                  <Link href={`/bugs/${b.id}/edit`} className="text-blue-600 hover:underline font-medium">{b.title}</Link>
                </td>
                <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-5 py-3 text-gray-600">{b.reporterName}</td>
                <td className="px-5 py-3 text-gray-500">{formatDate(b.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
