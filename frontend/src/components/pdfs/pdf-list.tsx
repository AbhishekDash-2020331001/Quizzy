"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, MoreHorizontal, Download, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UploadType } from "@/lib/types";
import { deleteUploadAction } from "@/action/uploads.action";
import { toast } from "sonner";
import { formatDateTime } from "@/utils/date";

export function PDFList({ uploads }: { uploads: UploadType[] }) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          All PDFs ({uploads.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {uploads.length === 0 ? (
          <p className="text-center text-gray-500">
            No PDFs found. Upload a PDF to get started.
          </p>
        ) : (
          uploads.map((upload) => (
            <div
              key={upload.id}
              className="p-4 rounded-lg border bg-white hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    {/* PDF Thumbnail */}
                    <div className="relative">
                      <div className="w-12 h-16 bg-gray-100 rounded border flex items-center justify-center">
                        <FileText className="h-6 w-6 text-gray-400" />
                      </div>
                      {upload.processing_state === 0 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 text-lg truncate">
                          {upload.pdf_name}
                        </h3>
                      </div>
                      <Badge
                        variant={
                          upload.processing_state === 1
                            ? "default"
                            : upload.processing_state === 0
                            ? "secondary"
                            : "destructive"
                        }
                        className={
                          upload.processing_state === 1
                            ? "bg-green-100 text-green-700"
                            : upload.processing_state === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {upload.processing_state === 0
                          ? "Processing"
                          : upload.processing_state === 1
                          ? "Processed"
                          : "Failed"}
                      </Badge>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {upload.pages || 0} pages
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Uploaded {formatDateTime(upload.created_at)}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild className="">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => {
                          const url = upload.url;
                          const link = document.createElement("a");
                          link.setAttribute("target", "_blank");
                          link.href = url;
                          link.download = upload.pdf_name;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={async () => {
                          toast.promise(deleteUploadAction({ id: upload.id }), {
                            loading: "Deleting PDF...",
                            success: () => {
                              window.location.reload();
                              return "PDF deleted successfully";
                            },
                            error: "Failed to delete PDF",
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
