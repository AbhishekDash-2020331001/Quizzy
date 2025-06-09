"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  X,
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useUploadThing } from "@/utils/uploadthing";
import { toast } from "sonner";

interface UploadPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (files: UploadedFile[]) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  displayName: string;
  url: string;
  size: number;
}

export function UploadPdfModal({
  isOpen,
  onClose,
  onSuccess,
}: UploadPdfModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [fileDetails, setFileDetails] = useState<
    Record<string, { displayName: string }>
  >({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [uploadSuccess, setUploadSuccess] = useState<string[]>([]);

  const { startUpload } = useUploadThing("pdfUploader", {
    onClientUploadComplete: (res) => {
      const uploadedFiles: UploadedFile[] = res.map((file) => {
        const details = fileDetails[file.name] || {
          displayName: file.name,
        };

        return {
          id: file.key,
          name: file.name,
          displayName: details.displayName,
          url: file.url,
          size: file.size,
        };
      });

      setIsUploading(false);
      setUploadSuccess(res.map((f) => f.name));

      setFiles([]);
      setFileDetails({});
      setUploadErrors({});
      setUploadSuccess([]);

      if (onSuccess) {
        onSuccess(uploadedFiles);
      }

      onClose();
    },
    onUploadError: (error) => {
      setIsUploading(false);
      toast.error(error.message);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).filter(
        (file) => file.type === "application/pdf"
      );

      // Initialize file details for new files
      const newFileDetails = { ...fileDetails };
      newFiles.forEach((file) => {
        if (!newFileDetails[file.name]) {
          newFileDetails[file.name] = {
            displayName: file.name.replace(/\.pdf$/i, ""),
          };
        }
      });

      setFileDetails(newFileDetails);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (fileName: string) => {
    setFiles(files.filter((file) => file.name !== fileName));

    // Clean up related state
    const newFileDetails = { ...fileDetails };
    delete newFileDetails[fileName];
    setFileDetails(newFileDetails);

    const newUploadErrors = { ...uploadErrors };
    delete newUploadErrors[fileName];
    setUploadErrors(newUploadErrors);

    setUploadSuccess(uploadSuccess.filter((name) => name !== fileName));
  };

  const updateFileDetail = (fileName: string, field: string, value: string) => {
    setFileDetails((prev) => ({
      ...prev,
      [fileName]: {
        ...prev[fileName],
        [field]: value,
      },
    }));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadErrors({});
    setUploadSuccess([]);

    try {
      await startUpload(files);
    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleClose = () => {
    if (!isUploading) {
      setFiles([]);
      setFileDetails({});
      setUploadErrors({});
      setUploadSuccess([]);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload PDFs
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Selection */}
          <div className="space-y-2">
            <Label>Select PDF Files</Label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => document.getElementById("pdf-upload")?.click()}
            >
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Click to select PDFs or drag and drop files here
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF files only, max 16MB each
              </p>
              <Input
                id="pdf-upload"
                type="file"
                accept=".pdf,application/pdf"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-4">
              <Label>
                {files.length} PDF{files.length > 1 ? "s" : ""} Selected
              </Label>

              {files.map((file, index) => (
                <div
                  key={file.name}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-sm truncate max-w-[200px]">
                        {file.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {formatFileSize(file.size)}
                      </Badge>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.name)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* File Details Form */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label
                        htmlFor={`display-name-${index}`}
                        className="text-xs"
                      >
                        Display Name
                      </Label>
                      <Input
                        id={`display-name-${index}`}
                        value={fileDetails[file.name]?.displayName || ""}
                        onChange={(e) =>
                          updateFileDetail(
                            file.name,
                            "displayName",
                            e.target.value
                          )
                        }
                        placeholder="Enter a display name for this PDF"
                        disabled={
                          isUploading || uploadSuccess.includes(file.name)
                        }
                      />
                    </div>
                  </div>

                  {/* Upload Status */}
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Uploading...</span>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {uploadErrors[file.name] && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{uploadErrors[file.name]}</span>
                    </div>
                  )}

                  {/* Success Message */}
                  {uploadSuccess.includes(file.name) && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Upload successful</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={
              files.length === 0 ||
              isUploading ||
              uploadSuccess.length === files.length
            }
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {files.length} PDF{files.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
