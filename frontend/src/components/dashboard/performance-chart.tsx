"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data for the chart
const performanceData = [
  { week: "Week 1", quizzes: 3, avgScore: 75, participants: 12 },
  { week: "Week 2", quizzes: 5, avgScore: 82, participants: 18 },
  { week: "Week 3", quizzes: 4, avgScore: 78, participants: 15 },
  { week: "Week 4", quizzes: 7, avgScore: 85, participants: 24 },
];

export function PerformanceChart() {
  const totalQuizzes = performanceData.reduce(
    (sum, week) => sum + week.quizzes,
    0
  );
  const avgScore = Math.round(
    performanceData.reduce((sum, week) => sum + week.avgScore, 0) /
      performanceData.length
  );
  const totalParticipants = performanceData.reduce(
    (sum, week) => sum + week.participants,
    0
  );

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          Performance Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {totalQuizzes}
            </div>
            <div className="text-sm text-gray-600">Total Quizzes</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{avgScore}%</div>
            <div className="text-sm text-gray-600">Avg Score</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {totalParticipants}
            </div>
            <div className="text-sm text-gray-600">Participants</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
