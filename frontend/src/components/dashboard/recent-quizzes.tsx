"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileQuestion,
  Users,
  MoreHorizontal,
  Share2,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { QuizType } from "@/lib/types";
import { toast } from "sonner";

export function RecentQuizzes({ quizzes }: { quizzes: QuizType[] }) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Quizzes</CardTitle>
        <Link href="/dashboard/quizzes">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {quizzes.length === 0 ? (
          <p className="text-center text-gray-500">
            No Quizzes found. Create a quiz to get started.
          </p>
        ) : (
          quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileQuestion className="h-5 w-5 text-green-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium text-gray-900 truncate max-w-[200px] sm:max-w-[300px]">
                    {quiz.name}
                  </h4>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{quiz.questions_count} questions</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {quiz.participants_count}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    quiz.processing_state === 1
                      ? "default"
                      : quiz.processing_state === 0
                      ? "secondary"
                      : "outline"
                  }
                  className={
                    quiz.processing_state === 1
                      ? "bg-green-100 text-green-700"
                      : quiz.processing_state === 0
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }
                >
                  {quiz.processing_state === 1
                    ? "Active"
                    : quiz.processing_state === 0
                    ? "Processing"
                    : "Draft"}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `http://${window.location.host}/dashboard/quizzes/${quiz.id}/take`
                        );
                        toast.success("Link copied to clipboard");
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
