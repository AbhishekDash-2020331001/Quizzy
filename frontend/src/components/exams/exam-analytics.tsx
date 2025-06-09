"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  FileQuestion,
  Users,
  Trophy,
  Clock,
  Calendar,
  ArrowLeft,
  BarChart3,
  Target,
  User,
} from "lucide-react";
import Link from "next/link";
import { QuizAnalyticsType } from "@/lib/types";

export default function QuizAnalytics({
  quizData,
}: {
  quizData: QuizAnalyticsType;
}) {
  const [activeTab, setActiveTab] = useState("overview");

  // Format dates for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Simple Bar Chart Component
  const SimpleBarChart = ({
    data,
    title,
    description,
  }: {
    data: any[];
    title: string;
    description: string;
  }) => {
    const maxValue = Math.max(...data.map((item) => item.count));

    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.score_range}%</span>
                <span className="text-gray-600">
                  {item.count} students ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(item.count / maxValue) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  // Question Success Chart Component
  const QuestionSuccessChart = () => {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Question Success Rate
          </CardTitle>
          <CardDescription>
            Percentage of correct answers per question
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {quizData.question_analytics.map((question, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">
                  Question {question.question_id}
                </span>
                <span className="text-gray-600">
                  {question.success_rate}% ({question.correct_attempts}/
                  {question.total_attempts})
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    question.success_rate >= 80
                      ? "bg-green-600"
                      : question.success_rate >= 60
                      ? "bg-blue-600"
                      : question.success_rate >= 40
                      ? "bg-yellow-600"
                      : "bg-red-600"
                  }`}
                  style={{ width: `${question.success_rate}%` }}
                ></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  // Score Distribution Pie Chart (using CSS)
  const ScoreDistributionPie = () => {
    const validData = quizData.score_distribution.filter(
      (item) => item.count > 0
    );
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Score Distribution
          </CardTitle>
          <CardDescription>Visual breakdown of score ranges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2">
              {validData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  ></div>
                  <span className="text-sm">
                    {item.score_range}% ({item.count} students)
                  </span>
                </div>
              ))}
            </div>

            {/* Visual representation */}
            <div className="space-y-3">
              {validData.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-16 text-sm font-medium">
                    {item.score_range}%
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: colors[index % colors.length],
                        minWidth: item.percentage > 0 ? "40px" : "0px",
                      }}
                    >
                      {item.percentage > 15 && `${item.percentage}%`}
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-600">
                    {item.count} students
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/quizzes"
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <FileQuestion className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Quiz Analytics
              </h1>
            </div>
            <p className="text-gray-600">
              {quizData.exam_name} • Created by {quizData.exam_creator}
            </p>
          </div>
        </div>

        {/* Quiz Info Card */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Quiz Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Quiz Type</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {quizData.quiz_type}
                  </Badge>
                  {quizData.topic && (
                    <Badge variant="outline" className="bg-blue-50">
                      {quizData.topic}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">Difficulty</p>
                <Badge
                  className={
                    quizData.quiz_difficulty === "easy"
                      ? "bg-green-100 text-green-800"
                      : quizData.quiz_difficulty === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {quizData.quiz_difficulty.charAt(0).toUpperCase() +
                    quizData.quiz_difficulty.slice(1)}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">Questions</p>
                <p className="font-medium">
                  {quizData.questions_count} questions
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">Duration</p>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <p className="font-medium">
                    {new Date(quizData.end_time).getTime() -
                      new Date(quizData.start_time).getTime() >
                    0
                      ? `${Math.round(
                          (new Date(quizData.end_time).getTime() -
                            new Date(quizData.start_time).getTime()) /
                            (1000 * 60)
                        )} minutes`
                      : "25 minutes"}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">Created On</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="font-medium">
                    {formatDate(quizData.created_at)}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">Start Time</p>
                <p className="font-medium">{formatDate(quizData.start_time)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">End Time</p>
                <p className="font-medium">{formatDate(quizData.end_time)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="scores">Scores</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Participants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {quizData.total_participants}
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {quizData.completion_rate}% completion rate
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Average Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {quizData.average_score}%
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Median: {quizData.median_score}%
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Highest Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {quizData.highest_score}%
                    </div>
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Lowest: {quizData.lowest_score}%
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Standard Deviation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {quizData.std_deviation.toFixed(2)}
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Score variability
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SimpleBarChart
                data={quizData.score_distribution}
                title="Score Distribution"
                description="Breakdown of scores by range"
              />
              <QuestionSuccessChart />
            </div>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Participant Performance
                </CardTitle>
                <CardDescription>
                  Detailed breakdown of individual performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Rank</th>
                        <th className="text-left py-3 px-4">Participant</th>
                        <th className="text-left py-3 px-4">Score</th>
                        <th className="text-left py-3 px-4">Correct</th>
                        <th className="text-left py-3 px-4">Completed At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizData.participants.map((participant, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {participant.ranking === 1 ? (
                                <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                                  <Trophy className="h-3 w-3 text-yellow-600" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                  <span className="text-xs font-medium">
                                    {participant.ranking}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <span>{participant.username}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                participant.score_percentage >= 80
                                  ? "bg-green-100 text-green-800"
                                  : participant.score_percentage >= 60
                                  ? "bg-blue-100 text-blue-800"
                                  : participant.score_percentage >= 40
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {participant.score_percentage}%
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {participant.correct_answers} /{" "}
                            {participant.total_questions}
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {formatDate(participant.completed_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scores Tab */}
          <TabsContent value="scores" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ScoreDistributionPie />

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Score Statistics
                  </CardTitle>
                  <CardDescription>
                    Key metrics about score performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-600 mb-1">
                          Average Score
                        </p>
                        <div className="text-2xl font-bold text-blue-700">
                          {quizData.average_score}%
                        </div>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-600 mb-1">
                          Median Score
                        </p>
                        <div className="text-2xl font-bold text-green-700">
                          {quizData.median_score}%
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-600 mb-1">
                          Highest Score
                        </p>
                        <div className="text-2xl font-bold text-yellow-700">
                          {quizData.highest_score}%
                        </div>
                      </div>

                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-600 mb-1">
                          Lowest Score
                        </p>
                        <div className="text-2xl font-bold text-red-700">
                          {quizData.lowest_score}%
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-purple-600">
                          Standard Deviation
                        </p>
                        <div className="text-lg font-bold text-purple-700">
                          {quizData.std_deviation.toFixed(2)}
                        </div>
                      </div>
                      <p className="text-xs text-purple-600">
                        A lower standard deviation indicates scores are
                        clustered around the average, while a higher value
                        indicates greater variability in performance.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
