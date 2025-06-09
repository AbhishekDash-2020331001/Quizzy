import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FileQuestion, Trophy, Coins } from "lucide-react";

export function StatsCards({
  total_pdfs,
  total_quizzes,
  total_exam_paticipated,
  total_credits,
}: {
  total_pdfs: number;
  total_quizzes: number;
  total_exam_paticipated: number;
  total_credits: number;
}) {
  const stats = [
    {
      title: "Total PDFs",
      value: total_pdfs,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Quizzes Created",
      value: total_quizzes,
      icon: FileQuestion,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Quizzes Participated",
      value: total_exam_paticipated,
      icon: Trophy,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Remaining Credits",
      value: total_credits,
      icon: Coins,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow"
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
