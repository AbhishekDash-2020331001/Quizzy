import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentPDFs } from "@/components/dashboard/recent-pdfs";
import { RecentQuizzes } from "@/components/dashboard/recent-quizzes";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { getDashboardInfoAction } from "@/action/dashboard.action";
import { DashboardInfoType } from "@/lib/types";

export default async function DashboardPage() {
  const dashboardInfo = (await getDashboardInfoAction()) as {
    success: boolean;
    data: DashboardInfoType;
    error?: string;
  };

  if (!dashboardInfo.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <p className="text-red-500">{dashboardInfo.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <DashboardHeader />

        {/* Stats Cards */}
        <StatsCards
          total_pdfs={dashboardInfo.data.total_pdf}
          total_quizzes={dashboardInfo.data.total_quiz}
          total_exam_paticipated={dashboardInfo.data.total_exam_participated}
          total_credits={dashboardInfo.data.credits}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent PDFs */}
          <RecentPDFs pdfs={dashboardInfo.data.recent_pdfs} />

          {/* Recent Quizzes */}
          <RecentQuizzes quizzes={dashboardInfo.data.recent_quizzes} />
        </div>
      </div>
    </div>
  );
}
