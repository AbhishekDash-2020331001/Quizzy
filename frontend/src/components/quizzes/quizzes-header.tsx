"use client";

import { Button } from "@/components/ui/button";
import { FileQuestion, Plus } from "lucide-react";
import { CreateQuizModal } from "../quiz-create/create-quiz-modal";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { UploadType } from "@/lib/types";

export function QuizzesHeader({ pdfs }: { pdfs: UploadType[] }) {
  const params = useSearchParams();
  const [isCreateQuizModalOpen, setIsCreateQuizModalOpen] = useState(
    params.get("create") === "true" || false
  );

  const handleQuizCreated = (quiz: any) => {
    console.log("Quiz created:", quiz);
    // Here you would typically update your state or trigger a refetch
    // of the quizzes list to show the newly created quiz
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <FileQuestion className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            My Quizzes
          </h1>
        </div>
        <p className="text-gray-600">
          Manage and create your AI-powered quizzes
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => setIsCreateQuizModalOpen(true)}
          disabled={pdfs.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Quiz
        </Button>
      </div>
      <CreateQuizModal
        isOpen={isCreateQuizModalOpen}
        onClose={() => setIsCreateQuizModalOpen(false)}
        onSuccess={handleQuizCreated}
        pdfs={pdfs.filter((pdf) => pdf.processing_state === 1)}
      />
    </div>
  );
}
