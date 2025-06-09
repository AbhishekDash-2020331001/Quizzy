"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { File, Search } from "lucide-react";

interface PdfReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfs: any[];
  onSelect: (pdf: any) => void;
}

export function PdfReferenceModal({
  isOpen,
  onClose,
  pdfs,
  onSelect,
}: PdfReferenceModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPdfs = pdfs.filter((pdf) =>
    pdf.pdf_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (pdf: any) => {
    onSelect(pdf);
    setSearchTerm("");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-96 max-h-96 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold mb-2">
            Select PDF to Reference
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search PDFs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        {/* PDF List */}
        <ScrollArea className="flex-1 p-4">
          {filteredPdfs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <File className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {searchTerm ? "No PDFs match your search" : "No PDFs available"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPdfs.map((pdf) => (
                <button
                  key={pdf.id}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  onClick={() => handleSelect(pdf)}
                >
                  <div className="flex items-center gap-3">
                    <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {pdf.pdf_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(pdf.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
