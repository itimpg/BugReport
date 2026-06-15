import { BugReportForm } from "@/components/bugs/BugReportForm";

export default function CreateBugPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Create Bug Report</h1>
      <BugReportForm />
    </div>
  );
}
