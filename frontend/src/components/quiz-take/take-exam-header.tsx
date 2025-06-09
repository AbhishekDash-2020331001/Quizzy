"use client";

import { Button } from "@/components/ui/button";
import { Clock, FileQuestion } from "lucide-react";
import { useEffect, useState } from "react";

interface TakeExamHeaderProps {
  examName: string;
  startTime: string;
  endTime: string;
  examQuestions: number;
  currentView: "exam" | "results" | "rankings";
  setCurrentView: (view: "exam" | "results" | "rankings") => void;
  isSubmitted: boolean;
}

export function TakeExamHeader({
  examName,
  startTime,
  endTime,
  examQuestions,
  currentView,
  setCurrentView,
  isSubmitted,
}: TakeExamHeaderProps) {
  const [remainingTime, setRemainingTime] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => {
      if (new Date(endTime).getTime() < Date.now()) {
        clearInterval(timer);
        setCurrentView("results");
      }
      const timeLeft = Math.floor(
        (new Date(endTime).getTime() - Date.now()) / 1000
      );
      const hours = Math.floor(timeLeft / 3600)
        .toString()
        .padStart(2, "0");
      const minutes = Math.floor((timeLeft % 3600) / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (timeLeft % 60).toString().padStart(2, "0");
      setRemainingTime(`${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <FileQuestion className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {examName}
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{examQuestions} Questions</span>
          <span>•</span>
          <span>
            {Math.floor(
              (new Date(endTime).getTime() - new Date(startTime).getTime()) /
                (1000 * 60)
            )}{" "}
            minutes
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isSubmitted && (
          <div className="flex items-center gap-2">
            <Button
              variant={currentView === "results" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentView("results")}
            >
              Results
            </Button>
            <Button
              variant={currentView === "rankings" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentView("rankings")}
            >
              Rankings
            </Button>
          </div>
        )}

        {!isSubmitted && (
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-blue-600 font-medium">{remainingTime}</span>
          </div>
        )}
      </div>
    </div>
  );
}
