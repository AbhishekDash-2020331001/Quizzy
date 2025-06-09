import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export function DashboardHeader() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-1">
        <p className="text-gray-600">Welcome back! Today is {currentDate}</p>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/dashboard/quizzes?create=true">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Quiz
          </Button>
        </Link>
      </div>
    </div>
  );
}
