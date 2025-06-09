"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";

export function QuestionNavigation({
  answeredCount,
  remainingCount,
}: {
  answeredCount: number;
  remainingCount: number;
}) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>{answeredCount} Answered</span>
              </div>
              <div className="flex items-center gap-1">
                <Circle className="h-4 w-4 text-gray-400" />
                <span>{remainingCount} Remaining</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
