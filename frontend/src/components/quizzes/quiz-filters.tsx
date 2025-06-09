"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";
import { QuizType } from "@/lib/types";

export function QuizFilters() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleTypeChange = (value: string) => {
    setType(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  return (
    <div className="">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search quizzes..."
            className="pl-10 bg-white"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={type} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="topic">Topic-based</SelectItem>
              <SelectItem value="page_range">Page Range</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="participants">Most Participants</SelectItem>
              <SelectItem value="questions">Most Questions</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// Helper function to filter and sort quizzes based on filter criteria
export function filterAndSortQuizzes(
  quizzes: QuizType[],
  filters: {
    search: string;
    type: string;
    sortBy: string;
  }
): QuizType[] {
  let filteredQuizzes = [...quizzes];

  // Apply search filter
  if (filters.search.trim()) {
    const searchTerm = filters.search.toLowerCase().trim();
    filteredQuizzes = filteredQuizzes.filter(
      (quiz) =>
        quiz.name.toLowerCase().includes(searchTerm) ||
        (quiz.topic && quiz.topic.toLowerCase().includes(searchTerm))
    );
  }

  // Apply type filter
  if (filters.type !== "all") {
    filteredQuizzes = filteredQuizzes.filter((quiz) => {
      if (filters.type === "topic") {
        return quiz.quiz_type === "topic";
      } else if (filters.type === "page_range") {
        return quiz.quiz_type === "page_range";
      } else if (filters.type === "multi") {
        return quiz.uploads && quiz.uploads.length > 1;
      }
      return true;
    });
  }

  // Apply sorting
  filteredQuizzes.sort((a, b) => {
    switch (filters.sortBy) {
      case "recent":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "name":
        return a.name.localeCompare(b.name);
      case "participants":
        return b.participants_count - a.participants_count;
      case "questions":
        return b.questions_count - a.questions_count;
      default:
        return 0;
    }
  });

  return filteredQuizzes;
}
