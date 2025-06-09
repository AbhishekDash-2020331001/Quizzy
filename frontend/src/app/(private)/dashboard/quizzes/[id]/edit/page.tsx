import { QuizEditWrapper } from "@/components/quiz-edit/quiz-edit-wrapper";
import { getQuizAction } from "@/action/quiz.action";

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;
  const quiz = await getQuizAction(p.id);

  if (!quiz.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <p className="text-red-500">{quiz.error}</p>
        </div>
      </div>
    );
  }

  return <QuizEditWrapper initialQuizData={quiz.data} quizId={p.id} />;
}
