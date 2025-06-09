import { Trophy } from "lucide-react";

export function ExamsHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Trophy className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            My Exam Analytics
          </h1>
        </div>
        <p className="text-gray-600">
          Track your exam participation and performance over time
        </p>
      </div>
    </div>
  );
}
