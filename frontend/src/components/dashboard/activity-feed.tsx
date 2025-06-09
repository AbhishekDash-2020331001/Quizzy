import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  FileQuestion,
  Users,
  Trophy,
  MessageSquare,
} from "lucide-react";

const activities = [
  {
    id: 1,
    type: "quiz_completed",
    title: "Quiz completed",
    description: "Machine Learning Basics",
    time: "2 hours ago",
    icon: Trophy,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  {
    id: 2,
    type: "pdf_uploaded",
    title: "PDF uploaded",
    description: "Neural Networks Guide.pdf",
    time: "4 hours ago",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    id: 3,
    type: "quiz_created",
    title: "Quiz created",
    description: "Deep Learning Fundamentals",
    time: "1 day ago",
    icon: FileQuestion,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    id: 5,
    type: "chat_session",
    title: "Chat session",
    description: "Asked 5 questions about AI",
    time: "3 days ago",
    icon: MessageSquare,
    color: "text-pink-600",
    bgColor: "bg-pink-100",
  },
];

export function ActivityFeed() {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${activity.bgColor} mt-0.5`}>
              <activity.icon className={`h-4 w-4 ${activity.color}`} />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
              <p className="text-sm text-gray-600">{activity.description}</p>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all activity
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
