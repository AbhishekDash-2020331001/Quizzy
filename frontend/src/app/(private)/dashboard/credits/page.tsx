import CreditPageWrapper from "@/components/credits/CreditPageWrapper";
import { getDashboardInfoAction } from "@/action/dashboard.action";
import { DashboardInfoType, PaymentHistoryType } from "@/lib/types";
import { getPaymentHistoryAction } from "@/action/payment.action";

const CreditsPage = async () => {
  const dashboardInfo = (await getDashboardInfoAction()) as {
    success: boolean;
    data: DashboardInfoType;
    error?: string;
  };

  const paymentHistory = (await getPaymentHistoryAction()) as {
    success: boolean;
    data: PaymentHistoryType[];
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
    <CreditPageWrapper
      oldBalance={dashboardInfo.data.credits}
      paymentHistory={paymentHistory.data}
    />
  );
};

export default CreditsPage;
