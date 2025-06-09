import { ExamsHeader } from "@/components/exams/exams-header";
import { ExamsOverview } from "@/components/exams/exams-overview";
import { RecentExams } from "@/components/exams/recent-exams";
import { getMyExamsAction } from "@/action/exam.action";
import { DashboardTakeType } from "@/lib/types";

export default async function ExamsPage() {
  const data = await getMyExamsAction();

  if (!data.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <p className="text-red-500">{data.error}</p>
        </div>
      </div>
    );
  }

  const exams = data.data as DashboardTakeType;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <ExamsHeader />

        {/* Overview Stats */}
        <ExamsOverview
          total_exams={exams.total_exams}
          avg_score={exams.avg_score}
          best_score={exams.best_score}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Exams - 2/3 width */}
          <div className="lg:col-span-2">
            <RecentExams exams={exams.takes} />
          </div>
        </div>
      </div>
    </div>
  );
}
