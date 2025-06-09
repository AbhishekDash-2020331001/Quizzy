"use client";

import { useEffect, useState } from "react";
import { PDFsHeader } from "@/components/pdfs/pdfs-header";
import { PDFFiltersWrapper } from "@/components/pdfs/pdf-filters-wrapper";
import { PDFList } from "@/components/pdfs/pdf-list";
import { listUploadsAction } from "@/action/uploads.action";
import { UploadType } from "@/lib/types";

export default function PDFsPage() {
  const [uploads, setUploads] = useState<UploadType[]>([]);
  const [filteredUploads, setFilteredUploads] = useState<UploadType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUploads() {
      try {
        const result = await listUploadsAction();
        if (result.success) {
          setUploads(result.data);
          setFilteredUploads(result.data);
        } else {
          setError(result.error || "Failed to load PDFs");
        }
      } catch (err) {
        setError("Failed to load PDFs");
      } finally {
        setLoading(false);
      }
    }

    fetchUploads();
  }, []);

  const handleFilteredPDFsChange = (filtered: UploadType[]) => {
    setFilteredUploads(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-lg text-gray-600">Loading PDFs...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <PDFsHeader />

        {/* Filters */}
        <PDFFiltersWrapper
          pdfs={uploads}
          onFilteredPDFsChange={handleFilteredPDFsChange}
        />

        {/* PDF List */}
        <PDFList uploads={filteredUploads} />
      </div>
    </div>
  );
}
