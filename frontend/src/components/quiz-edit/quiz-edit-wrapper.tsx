"use client";

import { useState } from "react";
import { EditQuizHeader } from "@/components/quiz-edit/edit-quiz-header";
import { QuizSettings } from "@/components/quiz-edit/quiz-settings";
import { QuestionsList } from "@/components/quiz-edit/questions-list";
import { updateQuizAction } from "@/action/quiz.action";
import { QuizType, QuestionType } from "@/lib/types";
import { toast } from "sonner";

interface QuizEditWrapperProps {
  initialQuizData: QuizType;
  quizId: string;
}

export function QuizEditWrapper({
  initialQuizData,
  quizId,
}: QuizEditWrapperProps) {
  const [quizData, setQuizData] = useState<QuizType>(initialQuizData);
  const [questions, setQuestions] = useState<QuestionType[]>(
    initialQuizData.questions
  );
  const [isLoading, setIsLoading] = useState(false);

  // Update quiz settings
  const updateQuizSettings = (updates: Partial<QuizType>) => {
    setQuizData((prev) => ({ ...prev, ...updates }));
  };

  // Update questions
  const updateQuestions = (newQuestions: QuestionType[]) => {
    setQuestions(newQuestions);
    // Also update the questions count in quiz data
    setQuizData((prev) => ({ ...prev, questions_count: newQuestions.length }));
  };

  // Save changes function
  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      // Save quiz settings
      const quizResult = await updateQuizAction({
        id: parseInt(quizId),
        name: quizData.name,
        retake: quizData.retake,
        start_time: quizData.start_time,
        end_time: quizData.end_time,
        quiz_type: quizData.quiz_type,
        topic: quizData.topic || "",
        start_page: quizData.start_page || null,
        end_page: quizData.end_page || null,
        upload_ids: quizData.uploads?.map((upload) => upload.id) || [],
        quiz_difficulty: quizData.quiz_difficulty,
        questions_count: questions.length,
        questions: questions.map((q) => ({
          id: q.id <= questions.length ? q.id : null,
          text: q.text,
          option_1: q.option_1,
          option_2: q.option_2,
          option_3: q.option_3,
          option_4: q.option_4,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
        })),
      });

      if (!quizResult.success) {
        toast.error(quizResult.error || "Failed to update quiz settings");
        return;
      }

      toast.success("Quiz updated successfully!");
    } catch (error) {
      toast.error("An error occurred while saving changes");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <EditQuizHeader
          quizId={quizId}
          onSave={handleSaveChanges}
          isLoading={isLoading}
          quizName={quizData.name}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quiz Settings */}
          <div className="lg:col-span-1">
            <QuizSettings quizData={quizData} onUpdate={updateQuizSettings} />
          </div>

          {/* Middle Column - Questions List */}
          <div className="lg:col-span-2">
            <QuestionsList
              questions={questions}
              onUpdate={updateQuestions}
              examId={parseInt(quizId)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
