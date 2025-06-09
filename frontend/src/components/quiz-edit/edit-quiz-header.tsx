import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

interface EditQuizHeaderProps {
  quizId: string;
  onSave?: () => Promise<void>;
  isLoading?: boolean;
  quizName?: string;
}

export function EditQuizHeader({
  quizId,
  onSave,
  isLoading = false,
  quizName,
}: EditQuizHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Edit Quiz
          </h1>
        </div>
        <p className="text-gray-600">
          {quizName || "Machine Learning Fundamentals Quiz"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={onSave} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
