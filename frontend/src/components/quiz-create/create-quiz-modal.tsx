"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  X,
  Calendar,
  Clock,
  FileQuestion,
  Loader2,
  AlertCircle,
  Search,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { UploadType } from "@/lib/types";
import { createQuizAction } from "@/action/quiz.action";
import { formatDateTime } from "@/utils/date";

interface CreateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (quiz: any) => void;
  pdfs: UploadType[];
}

export function CreateQuizModal({
  isOpen,
  onClose,
  onSuccess,
  pdfs,
}: CreateQuizModalProps) {
  const [selectedPDFs, setSelectedPDFs] = useState<number[]>([]);
  const [quizType, setQuizType] = useState<"topic" | "page_range" | "">("");
  const [quizName, setQuizName] = useState("");
  const [topic, setTopic] = useState("");
  const [startPage, setStartPage] = useState("");
  const [endPage, setEndPage] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [retake, setRetake] = useState(false);
  const [difficulty, setDifficulty] = useState("easy");
  const [questions_count, setQuestionsCount] = useState(10);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and search PDFs
  const filteredPDFs = useMemo(() => {
    return pdfs?.filter((pdf) => {
      const matchesSearch = pdf.pdf_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery]);

  const handlePDFToggle = (pdfId: number) => {
    setSelectedPDFs((prev) =>
      prev.includes(pdfId)
        ? prev.filter((id) => id !== pdfId)
        : [...prev, pdfId]
    );
    // Clear PDF selection error when user selects a PDF
    if (errors.pdfs) {
      setErrors((prev) => ({ ...prev, pdfs: "" }));
    }
  };

  const removePDF = (pdfId: number) => {
    setSelectedPDFs((prev) => prev.filter((id) => id !== pdfId));
  };

  const clearAllPDFs = () => {
    setSelectedPDFs([]);
  };

  const selectAllFilteredPDFs = () => {
    const filteredIds = filteredPDFs.map((pdf) => pdf.id);
    const newSelected = [...new Set([...selectedPDFs, ...filteredIds])];
    setSelectedPDFs(newSelected);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!quizName.trim()) {
      newErrors.quizName = "Quiz name is required";
    }

    if (selectedPDFs.length === 0) {
      newErrors.pdfs = "Please select at least one PDF";
    }

    if (!quizType) {
      newErrors.quizType = "Please select a quiz type";
    }

    if (quizType === "topic" && !topic.trim()) {
      newErrors.topic = "Topic is required";
    }

    if (quizType === "page_range") {
      if (!startPage || !endPage) {
        newErrors.pageRange = "Both start and end pages are required";
      } else {
        const start = Number.parseInt(startPage);
        const end = Number.parseInt(endPage);
        if (start < 1 || end < 1) {
          newErrors.pageRange = "Page numbers must be greater than 0";
        } else if (start > end) {
          newErrors.pageRange =
            "Start page must be less than or equal to end page";
        } else {
          // Check if page range is valid for selected PDFs
          const selectedPDFData = pdfs.filter((pdf) =>
            selectedPDFs.includes(pdf.id)
          );
          const maxPages = Math.max(...selectedPDFData.map((pdf) => pdf.pages));
          if (end > maxPages) {
            newErrors.pageRange = `End page cannot exceed ${maxPages} (maximum pages in selected PDFs)`;
          }
        }
      }
    }

    if (!startDateTime) {
      newErrors.startDateTime = "Start date and time is required";
    }

    if (!endDateTime) {
      newErrors.endDateTime = "End date and time is required";
    }

    if (startDateTime && endDateTime) {
      const start = new Date(startDateTime);
      const end = new Date(endDateTime);
      if (end <= start) {
        newErrors.endDateTime = "End time must be after start time";
      }
    }

    if (questions_count < 0) {
      newErrors.questions_count = "Questions count must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateQuiz = async () => {
    if (!validateForm()) return;

    setIsCreating(true);

    try {
      const quizData = await createQuizAction({
        name: quizName,
        retake,
        start_time: startDateTime,
        end_time: endDateTime,
        quiz_type: quizType,
        topic,
        start_page: Number(startPage),
        end_page: Number(endPage),
        upload_ids: selectedPDFs,
        quiz_difficulty: difficulty,
        questions_count,
      });

      if (!quizData.success) {
        toast(quizData.error);
        return;
      }

      toast(
        `Quiz "${quizName}" has been created. Please wait a few minutes for the questions to be prepared.`
      );

      if (onSuccess) {
        onSuccess(quizData);
      }

      handleClose();
      window.location.href = "/dashboard/quizzes";
    } catch (error) {
      toast("Failed to Create Quiz");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      // Reset form
      setSelectedPDFs([]);
      setQuizType("");
      setQuizName("");
      setTopic("");
      setStartPage("");
      setEndPage("");
      setStartDateTime("");
      setEndDateTime("");
      setSearchQuery("");
      setQuestionsCount(10);
      setRetake(false);
      setDifficulty("easy");
      setErrors({});
      onClose();
    }
  };

  const calculateDuration = () => {
    if (!startDateTime || !endDateTime) return "";
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const diffInMinutes = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60)
    );
    if (diffInMinutes <= 0) return "";
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const getSelectedPDFsData = () => {
    return pdfs.filter((pdf) => selectedPDFs.includes(pdf.id));
  };

  const getTotalPages = () => {
    const selectedPDFsData = getSelectedPDFsData();
    return selectedPDFsData.reduce((total, pdf) => total + pdf.pages, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-blue-600" />
            Create New Quiz
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quiz Name */}
          <div className="space-y-2">
            <Label htmlFor="quiz-name" className="text-sm font-medium">
              Quiz Name *
            </Label>
            <Input
              id="quiz-name"
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              placeholder="Enter a descriptive name for your quiz"
              disabled={isCreating}
              className={errors.quizName ? "border-red-500" : ""}
            />
            {errors.quizName && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.quizName}
              </p>
            )}
          </div>

          {/* PDF Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Select PDFs *</Label>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText className="h-4 w-4" />
                <span>{pdfs.length} PDFs available</span>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search PDFs by name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  disabled={isCreating}
                />
              </div>
            </div>

            {/* Selection Actions */}
            {filteredPDFs.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllFilteredPDFs}
                    disabled={isCreating}
                  >
                    Select All Visible
                  </Button>
                  {selectedPDFs.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearAllPDFs}
                      disabled={isCreating}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                <span className="text-gray-500">
                  {selectedPDFs.length} of {pdfs.length} selected
                </span>
              </div>
            )}

            {/* PDF List */}
            <ScrollArea className="max-h-[250px] p-3 border border-gray-200 rounded-md">
              {filteredPDFs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No PDFs found matching your search</p>
                  {searchQuery && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPDFs.map((pdf) => (
                    <div
                      key={pdf.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                        selectedPDFs.includes(pdf.id)
                          ? "bg-blue-50 border-blue-200 shadow-sm"
                          : "hover:bg-gray-50 border-gray-200"
                      }`}
                    >
                      <Checkbox
                        id={`pdf-${pdf.id}`}
                        checked={selectedPDFs.includes(pdf.id)}
                        onCheckedChange={() => handlePDFToggle(pdf.id)}
                        disabled={isCreating}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span className="font-medium text-sm truncate">
                            {pdf.pdf_name}
                          </span>
                          {selectedPDFs.includes(pdf.id) && (
                            <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{pdf.pages} pages</span>
                          <span>•</span>
                          <span>{formatDateTime(pdf.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <Separator />

            {/* Selected PDFs Summary */}
            {selectedPDFs.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Selected PDFs ({selectedPDFs.length})
                  </Label>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{getTotalPages()} total pages</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getSelectedPDFsData().map((pdf) => (
                    <Badge
                      key={pdf.id}
                      variant="secondary"
                      className="gap-2 py-1 px-3 bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      <span className="truncate max-w-[150px]">
                        {pdf.pdf_name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePDF(pdf.id)}
                        disabled={isCreating}
                        className="hover:bg-blue-300 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {errors.pdfs && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.pdfs}
              </p>
            )}
          </div>

          {/* Quiz Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quiz Creation Type *</Label>
            <Select
              value={quizType}
              onValueChange={(value: "topic" | "page_range") =>
                setQuizType(value)
              }
              disabled={isCreating}
            >
              <SelectTrigger
                className={`py-6 ${errors.quizType ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Choose how to generate quiz questions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="topic">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Topic-based Quiz</span>
                    <span className="text-xs text-gray-500">
                      Generate questions about a specific topic
                    </span>
                  </div>
                </SelectItem>
                <SelectItem
                  value="page_range"
                  disabled={selectedPDFs.length > 1}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Page Range Quiz</span>
                    <span className="text-xs text-gray-500">
                      Generate questions from specific pages
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.quizType && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.quizType}
              </p>
            )}

            {/* Topic Input */}
            {quizType === "topic" && (
              <div className="space-y-2 p-4 rounded-lg border border-gray-200">
                <Label htmlFor="topic" className="text-sm font-medium">
                  Topic *
                </Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Machine Learning Algorithms, Data Structures, etc."
                  disabled={isCreating}
                  className={errors.topic ? "border-red-500" : ""}
                />
                <p className="text-xs text-blue-700">
                  AI will generate questions based on this topic from the
                  selected PDFs
                </p>
                {errors.topic && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.topic}
                  </p>
                )}
              </div>
            )}

            {/* Page Range Inputs */}
            {quizType === "page_range" && (
              <div className="space-y-3 p-4 rounded-lg border border-gray-200">
                <Label className="text-sm font-medium">Page Range *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="start-page"
                      className="text-xs text-gray-600"
                    >
                      Start Page
                    </Label>
                    <Input
                      id="start-page"
                      type="number"
                      value={startPage}
                      onChange={(e) => setStartPage(e.target.value)}
                      placeholder="1"
                      min="1"
                      disabled={isCreating}
                      className={errors.pageRange ? "border-red-500" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-page" className="text-xs text-gray-600">
                      End Page
                    </Label>
                    <Input
                      id="end-page"
                      type="number"
                      value={endPage}
                      onChange={(e) => setEndPage(e.target.value)}
                      placeholder={
                        selectedPDFs.length > 0
                          ? getTotalPages().toString()
                          : "10"
                      }
                      min={startPage ? startPage : "1"}
                      disabled={isCreating}
                      className={errors.pageRange ? "border-red-500" : ""}
                    />
                  </div>
                </div>
                <p className="text-xs text-blue-700">
                  AI will generate questions from pages {startPage || "X"} to{" "}
                  {endPage || "Y"} across all selected PDFs
                </p>
                {selectedPDFs.length > 0 && (
                  <p className="text-xs text-gray-600">
                    Maximum pages available: {getTotalPages()}
                  </p>
                )}
                {errors.pageRange && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.pageRange}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* No of Question */}
          <div className="space-y-2">
            <Label htmlFor="no-of-questions" className="text-sm font-medium">
              No of Questions *
            </Label>
            <Input
              id="no-of-questions"
              type="number"
              value={questions_count}
              onChange={(e) => setQuestionsCount(Number(e.target.value))}
              placeholder="10"
              min="1"
              disabled={isCreating}
              className={errors.questions_count ? "border-red-500" : ""}
            />
            {errors.questions_count && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.questions_count}
              </p>
            )}
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <Label className="text-base font-medium">Quiz Schedule</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-datetime" className="text-sm font-medium">
                  Start Date & Time *
                </Label>
                <Input
                  id="start-datetime"
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  disabled={isCreating}
                  className={errors.startDateTime ? "border-red-500" : ""}
                />
                {startDateTime && (
                  <p className="text-xs text-gray-500">
                    Starts: {formatDateTime(startDateTime)}
                  </p>
                )}
                {errors.startDateTime && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.startDateTime}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-datetime" className="text-sm font-medium">
                  End Date & Time *
                </Label>
                <Input
                  id="end-datetime"
                  type="datetime-local"
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  min={startDateTime}
                  disabled={isCreating}
                  className={errors.endDateTime ? "border-red-500" : ""}
                />
                {endDateTime && (
                  <p className="text-xs text-gray-500">
                    Ends: {formatDateTime(endDateTime)}
                  </p>
                )}
                {errors.endDateTime && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.endDateTime}
                  </p>
                )}
              </div>
            </div>

            {calculateDuration() && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Quiz duration: <strong>{calculateDuration()}</strong>
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Retake */}
            <div className="flex items-center gap-2">
              <Label htmlFor="retake" className="text-sm font-medium">
                Allow Retake *
              </Label>
              <Checkbox
                id="retake"
                checked={retake}
                onCheckedChange={(checked) => setRetake(checked as boolean)}
                disabled={isCreating}
              />
            </div>

            {/* Difficulty */}
            <div className="flex items-center gap-2">
              <Label htmlFor="difficulty" className="text-sm font-medium">
                Difficulty *
              </Label>
              <Select
                value={difficulty}
                onValueChange={(value) => setDifficulty(value)}
                disabled={isCreating}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreateQuiz} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Quiz...
              </>
            ) : (
              <>
                <FileQuestion className="h-4 w-4 mr-2" />
                Create Quiz
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
