"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

const monthlyData = [
  { month: "Sep", exams: 8, avgScore: 72 },
  { month: "Oct", exams: 12, avgScore: 75 },
  { month: "Nov", exams: 15, avgScore: 78 },
  { month: "Dec", exams: 10, avgScore: 82 },
  { month: "Jan", exams: 7, avgScore: 85 },
];

export function PerformanceChart() {
  const maxScore = Math.max(...monthlyData.map((d) => d.avgScore));
  return (
    <div className="space-y-6">
      {/* Monthly Trend */}
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Monthly Performance
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            Last 5 months
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {monthlyData.map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{data.month}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{data.avgScore}%</span>
                    <span className="text-gray-500">({data.exams} exams)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(data.avgScore / maxScore) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
