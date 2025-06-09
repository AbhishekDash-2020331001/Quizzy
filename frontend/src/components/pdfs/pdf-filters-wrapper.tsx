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
import { UploadType } from "@/lib/types";
import { filterAndSortPDFs } from "./pdf-filters";

interface PDFFiltersWrapperProps {
  pdfs: UploadType[];
  onFilteredPDFsChange: (filteredPDFs: UploadType[]) => void;
}

export function PDFFiltersWrapper({
  pdfs,
  onFilteredPDFsChange,
}: PDFFiltersWrapperProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Memoized filtered PDFs
  const filteredPDFs = useMemo(() => {
    return filterAndSortPDFs(pdfs, { search, status, sortBy });
  }, [pdfs, search, status, sortBy]);

  // Notify parent when filtered PDFs change
  useEffect(() => {
    onFilteredPDFsChange(filteredPDFs);
  }, [filteredPDFs, onFilteredPDFsChange]);

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
