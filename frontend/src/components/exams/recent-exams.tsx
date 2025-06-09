"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileQuestion, Trophy } from "lucide-react";
import { DashboardTakeType } from "@/lib/types";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/utils/date";

const recentExams = [
  {
    id: 1,
    title: "Machine Learning Fundamentals",
    date: "2024-01-15",
    score: 85,
    totalQuestions: 20,
    correctAnswers: 17,
    timeSpent: "32:45",
    rank: 3,
    totalParticipants: 24,
    status: "completed",
    difficulty: "Intermediate",
  },
  {
    id: 2,
    title: "Data Structures Quiz",
    date: "2024-01-12",
    score: 92,
    totalQuestions: 15,
    correctAnswers: 14,
    timeSpent: "28:30",
    rank: 1,
    totalParticipants: 18,
    status: "completed",
    difficulty: "Advanced",
  },
  {
    id: 3,
    title: "Web Development Basics",
    date: "2024-01-10",
    score: 76,
    totalQuestions: 25,
    correctAnswers: 19,
    timeSpent: "45:20",
    rank: 8,
    totalParticipants: 32,
    status: "completed",
    difficulty: "Beginner",
  },
  {
    id: 4,
    title: "Database Design Principles",
    date: "2024-01-08",
    score: 88,
    totalQuestions: 18,
    correctAnswers: 16,
    timeSpent: "35:15",
    rank: 2,
    totalParticipants: 15,
    status: "completed",
    difficulty: "Intermediate",
  },
];

export function RecentExams({ exams }: { exams: DashboardTakeType["takes"] }) {
  const router = useRouter();

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-700";
    if (score >= 75) return "bg-blue-100 text-blue-700";
    if (score >= 60) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const getRankIcon = (rank: number | null) => {
    if (!rank) return null;
    if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-600" />;
    if (rank <= 3) return <Trophy className="h-4 w-4 text-gray-400" />;
    return null;
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Exam Participation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {exams.length === 0 ? (
          <p className="text-center text-gray-500">
            No Quizzes found. Create a quiz to get started.
          </p>
        ) : (
          exams.map((exam) => (
            <div
              key={exam.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-white hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => router.push(`/dashboard/exams/${exam.id}`)}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileQuestion className="h-5 w-5 text-blue-600" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">
                      {exam.quiz_name}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {exam.quiz_difficulty.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{formatDateTime(exam.quiz_created_at)}</span>
                    {exam.correct_answers && (
                      <>
                        <span>•</span>
                        <span>
                          {exam.correct_answers}/{exam.total_questions} correct
                        </span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          {getRankIcon(exam.ranking)}
                          <span>
                            Rank #{exam.ranking}/{exam.total_participants}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {exam.correct_answers && (
                  <Badge
                    className={getScoreBadgeColor(
                      (exam.correct_answers / exam.total_questions) * 100
                    )}
                  >
                    {(
                      (exam.correct_answers / exam.total_questions) *
                      100
                    ).toFixed(2)}
                    %
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
