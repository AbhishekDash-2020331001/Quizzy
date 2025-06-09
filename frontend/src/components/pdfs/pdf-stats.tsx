import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  HardDrive,
  FileQuestion,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const stats = [
  {
    title: "Total PDFs",
    value: "32",
    change: "+5 this week",
    trend: "up",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Storage Used",
    value: "2.4 GB",
    change: "+340 MB this week",
    trend: "up",
    icon: HardDrive,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "Quizzes Generated",
    value: "48",
    change: "+8 this week",
    trend: "up",
    icon: FileQuestion,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Processing",
    value: "3",
    change: "-1 from yesterday",
    trend: "down",
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
];

export function PDFStats() {
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
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              {stat.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span
                className={
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }
              >
                {stat.change}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
