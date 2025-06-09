"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy, Target } from "lucide-react";
import { QuestionType } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

export function ExamResults({
  questions,
  answers,
  score,
}: {
  questions: Omit<QuestionType, "correct_answer" | "explanation">[];
  answers: { question_id: number; answer: string }[];
  score: number;
}) {
  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-green-50">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-2">
                <Trophy className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {((score / questions.length) * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-gray-600">Final Score</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-2">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {score}/{questions.length}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question by Question Results */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Your Answers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Question {index + 1}</Badge>
                </div>
              </div>

              <p className="font-medium text-gray-900">{question.text}</p>

              <RadioGroup
                value={
                  answers.find((a) => a.question_id === question.id)?.answer ||
                  ""
                }
              >
                <div
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${
                    answers.find((a) => a.question_id === question.id)
                      ?.answer === "1"
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
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${
                    answers.find((a) => a.question_id === question.id)
                      ?.answer === "2"
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
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${
                    answers.find((a) => a.question_id === question.id)
                      ?.answer === "3"
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
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${
                    answers.find((a) => a.question_id === question.id)
                      ?.answer === "4"
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
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
