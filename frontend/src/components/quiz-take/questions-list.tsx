"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { QuestionType } from "@/lib/types";

interface QuestionsListProps {
  onSubmit: () => void;
  answers: { question_id: number; answer: string }[];
  setAnswers: Dispatch<
    SetStateAction<{ question_id: number; answer: string }[]>
  >;
  questions: Omit<QuestionType, "correct_answer" | "explanation">[];
}

export function QuestionsList({
  onSubmit,
  answers,
  setAnswers,
  questions,
}: QuestionsListProps) {
  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => {
      const existingAnswerIndex = prev.findIndex(
        (a) => a.question_id === questionId
      );

      if (existingAnswerIndex >= 0) {
        // Update existing answer
        return prev.map((a) =>
          a.question_id === questionId ? { ...a, answer: value } : a
        );
      } else {
        // Add new answer
        return [...prev, { question_id: questionId, answer: value }];
      }
    });
  };

  const handleSubmit = () => {
    const unanswered = questions.filter(
      (q) => !answers.find((a) => a.question_id === q.id)
    );
    if (unanswered.length > 0) {
      const confirm = window.confirm(
        `You have ${unanswered.length} unanswered questions. Are you sure you want to submit?`
      );
      if (!confirm) return;
    }
    onSubmit();
  };

  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <Card key={question.id} className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">
              Question {index + 1} of {questions.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-900 font-medium">{question.text}</p>

            <RadioGroup
              value={
                answers.find((a) => a.question_id === question.id)?.answer || ""
              }
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              <div
                onClick={() => handleAnswerChange(question.id, "1")}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${
                  answers.find((a) => a.question_id === question.id)?.answer ===
                  "1"
                    ? "bg-blue-100/50"
                    : "hover:bg-gray-50"
                }`}
              >
                <RadioGroupItem value="1" id={`q${question.id}-option1`} />
                <Label
                  htmlFor={`q${question.id}-option1`}
                  className="flex-1 cursor-pointer"
                >
                  <span className="font-medium mr-2">A.</span>
                  {question.option_1}
                </Label>
              </div>
              <div
                onClick={() => handleAnswerChange(question.id, "2")}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${
                  answers.find((a) => a.question_id === question.id)?.answer ===
                  "2"
                    ? "bg-blue-100/50"
                    : "hover:bg-gray-50"
                }`}
              >
                <RadioGroupItem value="2" id={`q${question.id}-option2`} />
                <Label
                  htmlFor={`q${question.id}-option2`}
                  className="flex-1 cursor-pointer"
                >
                  <span className="font-medium mr-2">B.</span>
                  {question.option_2}
                </Label>
              </div>
              <div
                onClick={() => handleAnswerChange(question.id, "3")}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${
                  answers.find((a) => a.question_id === question.id)?.answer ===
                  "3"
                    ? "bg-blue-100/50"
                    : "hover:bg-gray-50"
                }`}
              >
                <RadioGroupItem value="3" id={`q${question.id}-option3`} />
                <Label
                  htmlFor={`q${question.id}-option3`}
                  className="flex-1 cursor-pointer"
                >
                  <span className="font-medium mr-2">C.</span>
                  {question.option_3}
                </Label>
              </div>
              <div
                onClick={() => handleAnswerChange(question.id, "4")}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${
                  answers.find((a) => a.question_id === question.id)?.answer ===
                  "4"
                    ? "bg-blue-100/50"
                    : "hover:bg-gray-50"
                }`}
              >
                <RadioGroupItem value="4" id={`q${question.id}-option4`} />
                <Label
                  htmlFor={`q${question.id}-option4`}
                  className="flex-1 cursor-pointer"
                >
                  <span className="font-medium mr-2">D.</span>
                  {question.option_4}
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      ))}

      {/* Submit Section */}
      <Card className="border-0 shadow-md bg-blue-50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">Ready to submit?</h3>
              <p className="text-sm text-gray-600">
                You have answered {Object.keys(answers).length} out of{" "}
                {questions.length} questions
              </p>
            </div>
            <Button onClick={handleSubmit} size="lg">
              Submit Exam
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
