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
import { Button } from "@/components/ui/button";
import {
  User,
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  TrendingDown,
  Download,
  ArrowLeft,
  CheckCircle2,
  Activity,
  Zap,
  BookOpen,
  Star,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { UserAnalyticsType } from "@/lib/types";

export default function UserAnalytics({
  userData,
}: {
  userData: UserAnalyticsType;
}) {
  const [activeTab, setActiveTab] = useState("overview");

  // Subject Performance Chart
  const SubjectPerformanceChart = () => {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Topic Performance
          </CardTitle>
          <CardDescription>Performance breakdown by topic</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userData.subject_performance.map((subject, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{subject.subject}</h3>
                  <Badge variant="outline">{subject.exams_taken} exams</Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="font-bold text-blue-700">
                      {subject.average_score.toFixed(1)}%
                    </div>
                    <div className="text-blue-600">Average</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-bold text-green-700">
                      {subject.best_score}%
                    </div>
                    <div className="text-green-600">Best</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="font-bold text-red-700">
                      {subject.worst_score}%
                    </div>
                    <div className="text-red-600">Worst</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Trend:</span>
                  <Badge
                    className={
                      subject.improvement_trend === "improving"
                        ? "bg-green-100 text-green-800"
                        : subject.improvement_trend === "declining"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {subject.improvement_trend}
                  </Badge>
                </div>
              </div>
            ))}
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
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <User className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                User Analytics
              </h1>
            </div>
            <p className="text-gray-600">
              {userData.username} • Performance Overview
            </p>
          </div>
        </div>

        {/* User Profile Card */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {userData.username}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">
                  {userData.overall_average_score.toFixed(1)}%
                </div>
                <div className="text-sm text-blue-600">Overall Average</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {userData.comparison_stats.percentile_rank.toFixed(1)}
                </div>
                <div className="text-sm text-green-600">Percentile Rank</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">
                  {userData.activity_summary.total_exams_taken}
                </div>
                <div className="text-sm text-purple-600">Exams Taken</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">
                  {userData.activity_summary.streak_longest}
                </div>
                <div className="text-sm text-orange-600">Longest Streak</div>
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
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Activity Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {userData.activity_summary.total_questions_answered}
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Questions answered
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Accuracy Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {userData.activity_summary.overall_accuracy.toFixed(1)}%
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {userData.activity_summary.total_correct_answers} correct
                    answers
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Active Days
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {userData.activity_summary.active_days}
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Days with activity
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Current Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {userData.activity_summary.streak_current}
                    </div>
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Zap className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Consecutive days</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths & Weaknesses */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Strengths & Areas for Improvement
                  </CardTitle>
                  <CardDescription>
                    Analysis based on performance data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userData.strengths_weaknesses.map((item, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          item.category === "strength"
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {item.category === "strength" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          )}
                          <span
                            className={`font-medium ${
                              item.category === "strength"
                                ? "text-green-800"
                                : "text-red-800"
                            }`}
                          >
                            {item.category === "strength"
                              ? "Strength"
                              : "Area for Improvement"}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium">{item.subject}</div>
                          <div className="text-sm text-gray-600">
                            {item.description}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Average Score: </span>
                            <span
                              className={
                                item.category === "strength"
                                  ? "text-green-700"
                                  : "text-red-700"
                              }
                            >
                              {item.average_score.toFixed(1)}%
                            </span>
                            <span className="text-gray-500">
                              {" "}
                              ({item.exams_count} exams)
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <SubjectPerformanceChart />
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Difficulty Performance */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Performance by Difficulty
                  </CardTitle>
                  <CardDescription>
                    How you perform across different difficulty levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userData.difficulty_performance.map(
                      (difficulty, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium capitalize">
                              {difficulty.difficulty}
                            </span>
                            <Badge variant="outline">
                              {difficulty.exams_taken} exams
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="font-bold text-blue-700">
                                {difficulty.average_score.toFixed(1)}%
                              </div>
                              <div className="text-sm text-blue-600">
                                Average Score
                              </div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="font-bold text-green-700">
                                {difficulty.success_rate.toFixed(1)}%
                              </div>
                              <div className="text-sm text-green-600">
                                Success Rate
                              </div>
                            </div>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all duration-500 ${
                                difficulty.average_score >= 80
                                  ? "bg-green-600"
                                  : difficulty.average_score >= 60
                                  ? "bg-blue-600"
                                  : difficulty.average_score >= 40
                                  ? "bg-yellow-600"
                                  : "bg-red-600"
                              }`}
                              style={{ width: `${difficulty.average_score}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Progress */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Monthly Progress
                  </CardTitle>
                  <CardDescription>
                    Performance trends over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userData.monthly_progress.map((month, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">
                            {new Date(month.month + "-01").toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                              }
                            )}
                          </span>
                          <span className="text-gray-600">
                            {month.exams_count} exams
                          </span>
                        </div>

                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-700">
                            {month.average_score.toFixed(1)}%
                          </div>
                          <div className="text-sm text-blue-600">
                            Average Score
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${month.average_score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Performance Comparison
                </CardTitle>
                <CardDescription>
                  How you compare with other users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-3xl font-bold text-blue-700 mb-2">
                        {userData.comparison_stats.percentile_rank.toFixed(1)}
                      </div>
                      <div className="text-blue-600 font-medium">
                        Percentile Rank
                      </div>
                      <div className="text-sm text-blue-500 mt-1">
                        Better than{" "}
                        {userData.comparison_stats.better_than_percentage.toFixed(
                          1
                        )}
                        % of users
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Your Average
                        </span>
                        <span className="font-bold text-blue-700">
                          {userData.comparison_stats.user_average.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Global Average
                        </span>
                        <span className="font-bold text-gray-700">
                          {userData.comparison_stats.global_average.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Difference
                        </span>
                        <span
                          className={`font-bold ${
                            userData.comparison_stats.user_average >=
                            userData.comparison_stats.global_average
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {userData.comparison_stats.user_average >=
                          userData.comparison_stats.global_average
                            ? "+"
                            : ""}
                          {(
                            userData.comparison_stats.user_average -
                            userData.comparison_stats.global_average
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Performance Visualization</h3>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Your Performance</span>
                          <span>
                            {userData.comparison_stats.user_average.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-600 h-3 rounded-full"
                            style={{
                              width: `${userData.comparison_stats.user_average}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Global Average</span>
                          <span>
                            {userData.comparison_stats.global_average.toFixed(
                              1
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gray-500 h-3 rounded-full"
                            style={{
                              width: `${userData.comparison_stats.global_average}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800">
                          Performance Insight
                        </span>
                      </div>
                      <p className="text-sm text-green-700">
                        {userData.comparison_stats.user_average >=
                        userData.comparison_stats.global_average
                          ? `You're performing above average! You're in the top ${(
                              100 - userData.comparison_stats.percentile_rank
                            ).toFixed(0)}% of users.`
                          : `There's room for improvement. Focus on your weak areas to boost your ranking.`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
