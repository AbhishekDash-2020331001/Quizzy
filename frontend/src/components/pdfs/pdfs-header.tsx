"use client";

import { Button } from "@/components/ui/button";
import { FileText, Upload } from "lucide-react";
import { UploadPdfModal } from "./upload-pdf-modal";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { uploadPdfAction } from "@/action/uploads.action";
import { toast } from "sonner";

export function PDFsHeader() {
  const searchParams = useSearchParams();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(
    searchParams.get("modal") === "true"
  );

  const handleUploadSuccess = (files: { name: string; url: string }[]) => {
    (async () => {
      for (const file of files) {
        await uploadPdfAction({
          url: file.url,
          pdf_name: file.name,
        });
      }
      setIsUploadModalOpen(false);
      toast.success("PDFs uploaded successfully");
      window.location.reload();
    })();
  };
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              My PDFs
            </h1>
          </div>
          <p className="text-gray-600">
            Manage your uploaded documents and create quizzes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload PDF
          </Button>
        </div>
      </div>
      <UploadPdfModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </>
  );
}
