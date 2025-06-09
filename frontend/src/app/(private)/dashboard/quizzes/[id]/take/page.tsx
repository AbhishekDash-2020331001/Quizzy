import { getExamInfoAction } from "@/action/exam.action";
import { ExamStartCountdown } from "@/components/quiz-take/exam-start-countdown";

export default async function TakeExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;
  const examInfo = await getExamInfoAction(p.id);

  if (!examInfo.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <p className="text-red-500">{examInfo.error}</p>
        </div>
      </div>
    );
  }

  return <ExamStartCountdown exam={{ ...examInfo.data }} />;
}
