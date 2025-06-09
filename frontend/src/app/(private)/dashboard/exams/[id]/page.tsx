import { getExamAnswersAction } from "@/action/exam.action";
import { ExamAnswers } from "@/components/quiz-take/exams-answer";
import { ExamResultType } from "@/lib/types";

export default async function ExamAnswersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;
  const data = await getExamAnswersAction(Number(p.id));

  if (!data.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <p className="text-red-500">{data.error}</p>
        </div>
      </div>
    );
  }

  const answers = data.data as ExamResultType;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <ExamAnswers answers={answers} />
      </div>
    </div>
  );
}
