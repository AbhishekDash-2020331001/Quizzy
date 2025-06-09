"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Check } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionType } from "@/lib/types";

export function QuestionsList({
  questions,
  onUpdate,
  examId,
}: {
  questions: QuestionType[];
  onUpdate: (questions: QuestionType[]) => void;
  examId: number;
}) {
  const [localQuestions, setLocalQuestions] = useState(questions);

  // Update local state when questions prop changes
  useEffect(() => {
    setLocalQuestions(questions);
  }, [questions]);

  const addQuestion = () => {
    const newQuestion: QuestionType = {
      id: Date.now(),
      text: "",
      exam_id: examId,
      option_1: "",
      option_2: "",
      option_3: "",
      option_4: "",
      correct_answer: "1",
      explanation: "",
    };
    const updatedQuestions = [...localQuestions, newQuestion];
    setLocalQuestions(updatedQuestions);
    onUpdate(updatedQuestions);
  };

  const updateQuestion = (id: number, field: string, value: any) => {
    const updatedQuestions = localQuestions.map((q) =>
      q.id === id ? { ...q, [field]: value } : q
    );
    setLocalQuestions(updatedQuestions);
    onUpdate(updatedQuestions);
  };

  const deleteQuestion = (id: number) => {
    const updatedQuestions = localQuestions.filter((q) => q.id !== id);
    setLocalQuestions(updatedQuestions);
    onUpdate(updatedQuestions);
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          Questions ({localQuestions.length})
        </CardTitle>
        <Button onClick={addQuestion} variant={"secondary"} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {localQuestions.map((question, index) => (
          <div key={question.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Question {index + 1}</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteQuestion(question.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <Label>Question</Label>
              <Textarea
                value={question.text}
                onChange={(e) =>
                  updateQuestion(question.id, "text", e.target.value)
                }
                placeholder="Enter your question here..."
                rows={2}
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <Label>Answer Options</Label>
              <RadioGroup
                value={question.correct_answer!.toString()}
                onValueChange={(value) =>
                  updateQuestion(question.id, "correct_answer", value)
                }
              >
                <div key={"option_1"} className="flex items-center space-x-3">
                  <RadioGroupItem value={"1"} id={`q${question.id}-option1`} />
                  <div className="flex-1 relative">
                    <Input
                      value={question.option_1}
                      onChange={(e) =>
                        updateQuestion(question.id, "option_1", e.target.value)
                      }
                      placeholder={`Option A`}
                      className={
                        question.correct_answer === "1"
                          ? "border-green-500 bg-green-50"
                          : ""
                      }
                    />
                    {question.correct_answer === "1" && (
                      <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
                <div key={"option_2"} className="flex items-center space-x-3">
                  <RadioGroupItem value={"2"} id={`q${question.id}-option2`} />
                  <div className="flex-1 relative">
                    <Input
                      value={question.option_2}
                      onChange={(e) =>
                        updateQuestion(question.id, "option_2", e.target.value)
                      }
                      placeholder={`Option B`}
                      className={
                        question.correct_answer === "2"
                          ? "border-green-500 bg-green-50"
                          : ""
                      }
                    />
                    {question.correct_answer === "2" && (
                      <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
                <div key={"option_3"} className="flex items-center space-x-3">
                  <RadioGroupItem value={"3"} id={`q${question.id}-option3`} />
                  <div className="flex-1 relative">
                    <Input
                      value={question.option_3}
                      onChange={(e) =>
                        updateQuestion(question.id, "option_3", e.target.value)
                      }
                      placeholder={`Option C`}
                      className={
                        question.correct_answer === "3"
                          ? "border-green-500 bg-green-50"
                          : ""
                      }
                    />
                    {question.correct_answer === "3" && (
                      <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
                <div key={"option_4"} className="flex items-center space-x-3">
                  <RadioGroupItem value={"4"} id={`q${question.id}-option4`} />
                  <div className="flex-1 relative">
                    <Input
                      value={question.option_4}
                      onChange={(e) =>
                        updateQuestion(question.id, "option_4", e.target.value)
                      }
                      placeholder={`Option D`}
                      className={
                        question.correct_answer === "4"
                          ? "border-green-500 bg-green-50"
                          : ""
                      }
                    />
                    {question.correct_answer === "4" && (
                      <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
              </RadioGroup>
              <p className="text-xs text-gray-500">
                Select the radio button to mark the correct answer
              </p>
            </div>

            {/* Explanation */}
            <div className="space-y-2">
              <Label>Explanation</Label>
              <Textarea
                value={question.explanation}
                onChange={(e) =>
                  updateQuestion(question.id, "explanation", e.target.value)
                }
                placeholder="Explain why this is the correct answer..."
                rows={2}
              />
            </div>
          </div>
        ))}

        {localQuestions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No questions added yet</p>
            <Button onClick={addQuestion} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Question
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
