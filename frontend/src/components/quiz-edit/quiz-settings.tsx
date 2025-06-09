"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Calendar, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "../ui/badge";
import { QuizType } from "@/lib/types";

export function QuizSettings({
  quizData,
  onUpdate,
}: {
  quizData: QuizType;
  onUpdate: (updates: Partial<QuizType>) => void;
}) {
  const [startTime, setStartTime] = useState(quizData.start_time);
  const [endTime, setEndTime] = useState(quizData.end_time);
  const [duration, setDuration] = useState(
    Math.round(
      (new Date(quizData.end_time).getTime() -
        new Date(quizData.start_time).getTime()) /
        (1000 * 60)
    )
  );

  // Calculate duration when start or end time changes
  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffInMinutes = Math.round(
        (end.getTime() - start.getTime()) / (1000 * 60)
      );
      setDuration(diffInMinutes > 0 ? diffInMinutes : 0);
    }
  }, [startTime, endTime]);

  // Update parent component when values change
  useEffect(() => {
    onUpdate({ start_time: startTime, end_time: endTime });
  }, [startTime, endTime]); // Removed onUpdate from dependencies to avoid infinite loops

  const isValidTimeRange = () => {
    if (!startTime || !endTime) return true;
    return new Date(endTime) > new Date(startTime);
  };

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quiz Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="quiz-title">Quiz Title</Label>
          <Input
            id="quiz-title"
            className="flex-1"
            value={quizData.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2">
          <Label>Difficulty</Label>
          <Select
            value={quizData.quiz_difficulty}
            onValueChange={(value) => onUpdate({ quiz_difficulty: value })}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Schedule Section */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <Label className="text-base font-medium">Quiz Schedule</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-time">Start Date & Time</Label>
            <Input
              id="start-time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full"
            />
            {startTime && (
              <p className="text-xs text-gray-500">
                Starts: {formatDateTime(startTime)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-time">End Date & Time</Label>
            <Input
              id="end-time"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={`w-full ${
                !isValidTimeRange() ? "border-red-500" : ""
              }`}
            />
            {endTime && (
              <p className="text-xs text-gray-500">
                Ends: {formatDateTime(endTime)}
              </p>
            )}
          </div>

          {!isValidTimeRange() && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-600">
                End time must be after start time
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <div className="flex items-center gap-2">
              <Input
                id="duration"
                type="number"
                value={duration}
                disabled
                className="bg-gray-50"
              />
              <Badge variant="outline" className="whitespace-nowrap">
                <Clock className="h-3 w-3 mr-1" />
                {Math.floor(duration / 60)}h {duration % 60}m
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Duration is automatically calculated from start and end times
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="allow-retake">Allow Retake</Label>
            <Switch
              id="allow-retake"
              checked={quizData.retake}
              onCheckedChange={(checked) => onUpdate({ retake: checked })}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="questions-count">Quiz Type</Label>
          <Badge variant="outline">{quizData.quiz_type.toUpperCase()}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="questions-count">Number of Questions</Label>
          <Badge variant="outline">{quizData.questions_count}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
