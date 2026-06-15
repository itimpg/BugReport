"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { BugReport } from "@/types";
import { BugReportForm } from "@/components/bugs/BugReportForm";

export default function EditBugPage() {
  const params = useParams<{ id: string }>();
  const [bug, setBug] = useState<BugReport | null>(null);

  useEffect(() => {
    api.get<BugReport>(`/bugs/${params.id}`).then(setBug);
  }, [params.id]);

  if (!bug) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Edit Bug Report</h1>
      {bug.imageUrl && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <img
            src={bug.imageUrl}
            alt="Bug screenshot"
            className="w-full max-h-80 object-contain"
          />
        </div>
      )}
      <BugReportForm bug={bug} />
    </div>
  );
}
