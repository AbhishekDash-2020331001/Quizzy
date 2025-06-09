"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { QuizType } from "@/lib/types";
import { filterAndSortQuizzes } from "./quiz-filters";

interface QuizFiltersWrapperProps {
  quizzes: QuizType[];
  onFilteredQuizzesChange: (filteredQuizzes: QuizType[]) => void;
}

export function QuizFiltersWrapper({
  quizzes,
  onFilteredQuizzesChange,
}: QuizFiltersWrapperProps) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Memoized filtered quizzes
  const filteredQuizzes = useMemo(() => {
    return filterAndSortQuizzes(quizzes, { search, type, sortBy });
  }, [quizzes, search, type, sortBy]);

  // Notify parent when filtered quizzes change
  useEffect(() => {
    onFilteredQuizzesChange(filteredQuizzes);
  }, [filteredQuizzes, onFilteredQuizzesChange]);

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
