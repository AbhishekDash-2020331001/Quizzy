import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, User } from "lucide-react";

export function ExamRankings({
  rankings,
  isLoading,
}: {
  rankings: { id: number; username: string; correct_answers: number }[];
  isLoading: boolean;
}) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-600" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return <span className="text-gray-600 font-medium">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-50 border-yellow-200";
      case 2:
        return "bg-gray-50 border-gray-200";
      case 3:
        return "bg-orange-50 border-orange-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top 3 Podium */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-center">
            🏆 Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {rankings.slice(0, 3).map((participant, index) => (
              <div
                key={participant.id + "_" + index}
                className={`${
                  index === 0 ? "max-md:col-span-2" : ""
                } text-center p-4 rounded-lg border-2 ${
                  participant.id === rankings[0].id
                    ? "bg-blue-50 border-blue-300"
                    : getRankColor(index + 1)
                }`}
              >
                <div className="flex justify-center mb-2">
                  {getRankIcon(index + 1)}
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  {participant.username}
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {participant.correct_answers} correct
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Full Rankings */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            All Participants ({rankings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rankings.map((participant, index) => (
              <div
                key={participant.id + "_" + index}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  participant.id === rankings[0].id
                    ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8">
                    {index + 1 <= 3 ? (
                      getRankIcon(index + 1)
                    ) : (
                      <span className="text-gray-600 font-medium">
                        #{index + 1}
                      </span>
                    )}
                  </div>

                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">
                        {participant.username}
                      </h3>
                      {participant.id === rankings[0].id && (
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-700 border-blue-300"
                        >
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {participant.correct_answers}/15 correct
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
