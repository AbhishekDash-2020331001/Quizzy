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
import { useState, useEffect } from "react";
import { UploadType } from "@/lib/types";

interface PDFFiltersProps {
  pdfs: UploadType[];
}

export function PDFFilters({ pdfs }: PDFFiltersProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
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
            placeholder="Search PDFs..."
            className="pl-10 bg-white"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="pages">Most Pages</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// Helper function to filter and sort PDFs based on filter criteria
export function filterAndSortPDFs(
  pdfs: UploadType[],
  filters: {
    search: string;
    status: string;
    sortBy: string;
  }
): UploadType[] {
  let filteredPDFs = [...pdfs];

  // Apply search filter
  if (filters.search.trim()) {
    const searchTerm = filters.search.toLowerCase().trim();
    filteredPDFs = filteredPDFs.filter((pdf) =>
      pdf.pdf_name.toLowerCase().includes(searchTerm)
    );
  }

  // Apply status filter
  if (filters.status !== "all") {
    filteredPDFs = filteredPDFs.filter((pdf) => {
      if (filters.status === "processed") {
        return pdf.processing_state === 1;
      } else if (filters.status === "processing") {
        return pdf.processing_state === 0;
      }
      return true;
    });
  }

  // Apply sorting
  filteredPDFs.sort((a, b) => {
    switch (filters.sortBy) {
      case "recent":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "name":
        return a.pdf_name.localeCompare(b.pdf_name);
      case "pages":
        return b.pages - a.pages;
      default:
        return 0;
    }
  });

  return filteredPDFs;
}
