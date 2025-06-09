import { getAnalyticsAction } from "@/action/dashboard.action";
import UserAnalytics from "@/components/dashboard/analytics";

export default async function AnalyticsPage() {
  const analytics = await getAnalyticsAction();

  if (!analytics.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <p className="text-red-500">{analytics.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <UserAnalytics userData={analytics.data} />
      </div>
    </div>
  );
}
