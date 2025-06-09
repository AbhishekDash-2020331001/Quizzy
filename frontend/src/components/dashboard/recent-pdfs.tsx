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
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { UploadType } from "@/lib/types";
import { toast } from "sonner";
import { deleteUploadAction } from "@/action/uploads.action";
import { useRouter } from "next/navigation";

export function RecentPDFs({ pdfs }: { pdfs: UploadType[] }) {
  const router = useRouter();

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent PDFs</CardTitle>
        <Link href="/dashboard/pdfs">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {pdfs.length === 0 ? (
          <p className="text-center text-gray-500">
            No PDFs found. Upload a PDF to get started.
          </p>
        ) : (
          pdfs.map((pdf) => (
            <div
              key={pdf.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium text-gray-900 truncate max-w-[200px] sm:max-w-[300px]">
                    {pdf.pdf_name}
                  </h4>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{pdf.pages} pages</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={pdf.processing_state === 1 ? "default" : "secondary"}
                  className={
                    pdf.processing_state === 1
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }
                >
                  {pdf.processing_state === 1 ? "Processed" : "Processing"}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        const url = pdf.url;
                        const link = document.createElement("a");
                        link.setAttribute("target", "_blank");
                        link.href = url;
                        link.download = pdf.pdf_name;
                        link.click();
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={async () => {
                        toast.promise(deleteUploadAction({ id: pdf.id }), {
                          loading: "Deleting PDF...",
                          success: "PDF deleted successfully",
                          error: "Failed to delete PDF",
                        });
                        router.refresh();
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
