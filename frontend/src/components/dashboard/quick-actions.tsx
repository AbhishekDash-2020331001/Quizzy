"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileQuestion, MessageSquare, BarChart3 } from "lucide-react";
import Link from "next/link";

const actions = [
  {
    title: "Upload PDF",
    description: "Add new documents",
    icon: Upload,
    color: "bg-blue-500 hover:bg-blue-600",
    href: "/dashboard/pdfs?modal=true",
  },
  {
    title: "Create Quiz",
    description: "Generate new quiz",
    icon: FileQuestion,
    color: "bg-green-500 hover:bg-green-600",
    href: "/dashboard/quizzes?create=true",
  },
  {
    title: "Chat with PDFs",
    description: "Ask questions",
    icon: MessageSquare,
    color: "bg-purple-500 hover:bg-purple-600",
    href: "/dashboard/chat",
  },
  {
    title: "View Analytics",
    description: "Performance insights",
    icon: BarChart3,
    color: "bg-orange-500 hover:bg-orange-600",
    href: "/dashboard/analytics",
  },
];

export function QuickActions() {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid max-md:grid-cols-2 grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all"
            asChild
          >
            <Link href={action.href}>
              <div className={`p-2 rounded-lg text-white ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-gray-500">
                  {action.description}
                </div>
              </div>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
