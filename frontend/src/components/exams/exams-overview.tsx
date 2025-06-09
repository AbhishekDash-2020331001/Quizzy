import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, FileQuestion, Target, Award } from "lucide-react";

const stats = [
  {
    title: "Total Exams",
    value: "42",
    icon: FileQuestion,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Average Score",
    value: "78%",
    icon: Target,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Best Score",
    value: "95%",
    icon: Trophy,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  {
    title: "Completion Rate",
    value: "92%",
    icon: Award,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
];

export function ExamsOverview({
  total_exams,
  avg_score,
  best_score,
  completion_rate = 77,
}: {
  total_exams: number;
  avg_score: number;
  best_score: number;
  completion_rate?: number;
}) {
  stats[0].value = total_exams.toString();
  stats[1].value = avg_score.toString() + "%";
  stats[2].value = best_score.toString() + "%";
  stats[3].value = completion_rate.toString() + "%";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="border-0 shadow-md hover:shadow-lg transition-shadow"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
