"use client";

import { useEffect, useState } from "react";
import { QuizzesHeader } from "@/components/quizzes/quizzes-header";
import { QuizFiltersWrapper } from "@/components/quizzes/quiz-filters-wrapper";
import { QuizList } from "@/components/quizzes/quiz-list";
import { listUploadsAction } from "@/action/uploads.action";
import { getQuizzesAction } from "@/action/quiz.action";
import { UploadType, QuizType } from "@/lib/types";

export default function QuizzesPage() {
  const [pdfs, setPdfs] = useState<UploadType[]>([]);
  const [quizzes, setQuizzes] = useState<QuizType[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<QuizType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const pdfsPromise = listUploadsAction();
        const quizzesPromise = getQuizzesAction();

        const [pdfsResult, quizzesResult] = await Promise.all([
          pdfsPromise,
          quizzesPromise,
        ]);

        if (pdfsResult.success && quizzesResult.success) {
          setPdfs(pdfsResult.data);
          setQuizzes(quizzesResult.data);
          setFilteredQuizzes(quizzesResult.data);
        } else {
          setError(
            pdfsResult.error || quizzesResult.error || "Failed to load data"
          );
        }
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleFilteredQuizzesChange = (filtered: QuizType[]) => {
    setFilteredQuizzes(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-lg text-gray-600">Loading quizzes...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <QuizzesHeader pdfs={pdfs} />

        {/* Filters */}
        <QuizFiltersWrapper
          quizzes={quizzes}
          onFilteredQuizzesChange={handleFilteredQuizzesChange}
        />

        {/* Quiz List */}
        <QuizList quizzes={filteredQuizzes} />
      </div>
    </div>
  );
}
