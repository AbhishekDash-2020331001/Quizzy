"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Trophy, Target } from "lucide-react";
import { ExamResultType } from "@/lib/types";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { getExamRankingsAction } from "@/action/exam.action";
import { toast } from "sonner";
import { ExamRankings } from "./exam-rankings";

export function ExamAnswers({ answers }: { answers: ExamResultType }) {
  const [isRanking, setIsRanking] = useState(false);
  const [isFetchingRankings, setIsFetchingRankings] = useState(false);
  const [rankings, setRankings] = useState<
    { id: number; username: string; correct_answers: number }[]
  >([]);

  useEffect(() => {
    if (isRanking) {
      const fetchRankings = async () => {
        setIsFetchingRankings(true);
        const rankingsResponse = await getExamRankingsAction(answers.exam.id);
        if (!rankingsResponse.success) {
          toast.error(rankingsResponse.error);
          return;
        }
        const rankingsData = rankingsResponse.data;
        setRankings(rankingsData);
        setIsFetchingRankings(false);
      };

      fetchRankings();
    }
  }, [isRanking]);

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-green-50">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-2">
                <Trophy className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {answers.score_percentage}%
              </div>
              <div className="text-sm text-gray-600">Final Score</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-2">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {answers.correct_answers}/{answers.total_questions}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mx-auto mb-2">
                <Trophy className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                #{answers.ranking}
              </div>
              <div className="text-sm text-gray-600">Your Rank</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" onClick={() => setIsRanking(!isRanking)}>
        {isRanking ? "Hide Rankings" : "Show Rankings"}
      </Button>

      {isRanking ? (
        <ExamRankings rankings={rankings} isLoading={isFetchingRankings} />
      ) : (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center justify-between">
              <div>Detailed Results</div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {answers.questions.map((result, index) => (
              <div key={result.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Question {index + 1}</Badge>
                    {result.is_correct ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <Badge
                    variant={result.is_correct ? "default" : "destructive"}
                    className={
                      result.is_correct
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  >
                    {result.is_correct ? "Correct" : "Incorrect"}
                  </Badge>
                </div>

                <p className="font-medium text-gray-900">{result.text}</p>

                <div className="space-y-2">
                  <div
                    className={`p-3 rounded-lg border ${
                      result.correct_answer === "1"
                        ? "bg-green-50 border-green-300"
                        : result.user_answer === "1" && !result.is_correct
                        ? "bg-red-50 border-red-300"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span>{result.option_1}</span>
                      {result.correct_answer === "1" && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
                      )}
                      {result.user_answer === "1" && !result.is_correct && (
                        <XCircle className="h-4 w-4 text-red-600 ml-auto" />
                      )}
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg border ${
                      result.correct_answer === "2"
                        ? "bg-green-50 border-green-300"
                        : result.user_answer === "2" && !result.is_correct
                        ? "bg-red-50 border-red-300"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span>{result.option_2}</span>
                      {result.correct_answer === "2" && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
                      )}
                      {result.user_answer === "2" && !result.is_correct && (
                        <XCircle className="h-4 w-4 text-red-600 ml-auto" />
                      )}
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg border ${
                      result.correct_answer === "3"
                        ? "bg-green-50 border-green-300"
                        : result.user_answer === "3" && !result.is_correct
                        ? "bg-red-50 border-red-300"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span>{result.option_3}</span>
                      {result.correct_answer === "3" && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
                      )}
                      {result.user_answer === "3" && !result.is_correct && (
                        <XCircle className="h-4 w-4 text-red-600 ml-auto" />
                      )}
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg border ${
                      result.correct_answer === "4"
                        ? "bg-green-50 border-green-300"
                        : result.user_answer === "4" && !result.is_correct
                        ? "bg-red-50 border-red-300"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span>{result.option_4}</span>
                      {result.correct_answer === "4" && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
                      )}
                      {result.user_answer === "4" && !result.is_correct && (
                        <XCircle className="h-4 w-4 text-red-600 ml-auto" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">
                    Explanation:
                  </h4>
                  <p className="text-blue-800 text-sm">{result.explanation}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
