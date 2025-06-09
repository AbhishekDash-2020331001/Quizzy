"use client";

import { useEffect, useState } from "react";
import { TakeExamHeader } from "@/components/quiz-take/take-exam-header";
import { QuestionNavigation } from "@/components/quiz-take/question-navigation";
import { QuestionsList as ExamQuestionsList } from "@/components/quiz-take/questions-list";
import { ExamResults } from "@/components/quiz-take/exam-results";
import { ExamRankings } from "@/components/quiz-take/exam-rankings";
import { TakeExamType } from "@/lib/types";
import { getExamRankingsAction, submitExamAction } from "@/action/exam.action";
import { toast } from "sonner";
import useTabActive from "@/hooks/useTabActive";

export function QuizTakeWrapper({
  examData,
  examStatus,
}: {
  examData: TakeExamType;
  examStatus: "upcoming" | "active" | "ended";
}) {
  const [currentView, setCurrentView] = useState<
    "exam" | "results" | "rankings"
  >("exam");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answers, setAnswers] = useState<
    { question_id: number; answer: string }[]
  >([]);
  const [score, setScore] = useState<number>(0);
  const isTabActive = useTabActive();
  const [isFetchingRankings, setIsFetchingRankings] = useState(false);
  const [rankings, setRankings] = useState<
    { id: number; username: string; correct_answers: number }[]
  >([]);

  const handleSubmitExam = async () => {
    setIsSubmitted(true);
    const response = await submitExamAction({
      takes_id: examData.takes_id,
      answers,
    });
    if (!response.success) {
      toast.error(response.error);
      return;
    }
    toast.success("Exam submitted successfully");
    setScore(response.data.correct_answers);

    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentView("results");
  };

  useEffect(() => {
    if (
      !isSubmitted &&
      (examStatus === "ended" || (!isTabActive && examStatus === "active"))
    ) {
      handleSubmitExam();
    }
  }, [examStatus, isTabActive]);

  useEffect(() => {
    const fetchRankings = async () => {
      setIsFetchingRankings(true);
      if (currentView === "rankings") {
        const rankingsResponse = await getExamRankingsAction(examData.exam.id);
        if (!rankingsResponse.success) {
          toast.error(rankingsResponse.error);
          return;
        }
        const rankingsData = rankingsResponse.data;
        setRankings(rankingsData);
      }
      setIsFetchingRankings(false);
    };
    fetchRankings();
  }, [currentView]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <TakeExamHeader
          examName={examData.exam.name}
          startTime={examData.exam.start_time}
          endTime={examData.exam.end_time}
          examQuestions={examData.questions.length}
          currentView={currentView}
          setCurrentView={setCurrentView}
          isSubmitted={isSubmitted}
        />

        {currentView === "exam" && !isSubmitted && (
          <>
            {/* Question Navigation */}
            <QuestionNavigation
              answeredCount={
                examData.questions.filter((question) =>
                  answers.find((a) => a.question_id === question.id)
                ).length
              }
              remainingCount={
                examData.questions.length -
                examData.questions.filter((question) =>
                  answers.find((a) => a.question_id === question.id)
                ).length
              }
            />

            {/* Questions List */}
            <ExamQuestionsList
              questions={examData.questions}
              answers={answers}
              setAnswers={setAnswers}
              onSubmit={handleSubmitExam}
            />
          </>
        )}

        {currentView === "results" && isSubmitted && (
          <ExamResults
            questions={examData.questions}
            answers={answers}
            score={score}
          />
        )}

        {currentView === "rankings" && isSubmitted && (
          <ExamRankings rankings={rankings} isLoading={isFetchingRankings} />
        )}
      </div>
    </div>
  );
}
