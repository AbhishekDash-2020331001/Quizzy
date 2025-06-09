import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileQuestion, Users, BarChart3 } from "lucide-react";

export function QuizPreview() {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quiz Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">
            Machine Learning Fundamentals
          </h3>
          <p className="text-sm text-gray-600">
            Comprehensive quiz covering basic ML concepts and algorithms
          </p>

          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              Machine Learning
            </Badge>
            <Badge variant="outline" className="text-xs">
              Intermediate
            </Badge>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            <FileQuestion className="h-4 w-4 text-gray-400" />
            <span>15 Questions</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>45 minutes</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-gray-400" />
            <span>24 participants</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4 text-gray-400" />
            <span>78% average score</span>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <h4 className="font-medium text-sm">Settings</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Shuffle Questions:</span>
              <span>No</span>
            </div>
            <div className="flex justify-between">
              <span>Show Results:</span>
              <span>Immediately</span>
            </div>
            <div className="flex justify-between">
              <span>Allow Retake:</span>
              <span>No</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
