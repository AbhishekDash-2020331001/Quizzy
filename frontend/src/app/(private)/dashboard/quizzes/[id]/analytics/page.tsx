import { getQuizAnalyticsAction } from "@/action/quiz.action";
import QuizAnalytics from "@/components/exams/exam-analytics";

export default async function QuizAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;
  const quiz = await getQuizAnalyticsAction(p.id);

  if (!quiz.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <p className="text-red-500">{quiz.error}</p>
        </div>
      </div>
    );
  }

  return <QuizAnalytics quizData={quiz.data} />;
}
