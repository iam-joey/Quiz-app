"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Progress } from "@/components/ui/progress";
import { getTopicDoc } from "@/src/lib/actions";

export default function PdfUploader({
  params,
}: {
  params: {
    topicId: string;
  };
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [checkingDocument, setCheckingDocument] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkExistingDocument = async () => {
      const result = await getTopicDoc(params.topicId);
      if (!result.err && result.data && result.data.docfileName) {
        router.push(`/docs/view/${params.topicId}`);
      } else {
        setCheckingDocument(false);
      }
    };

    checkExistingDocument();
  }, [params.topicId, router]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      toast.error("Please select a valid PDF file");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const base64File = await convertFileToBase64(file, (progress) => {
        setUploadProgress(progress * 50); // File reading progress (0-50%)
      });

      const response = await fetch(`/api/docupload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topicId: params.topicId,
          file: base64File,
        }),
      });

      setUploadProgress(75);

      const data = await response.json();

      if (data.error) {
        toast.error(data.message);
      } else {
        toast.success(data.message);
        setFile(null);
        router.push(`/docs/view/${params.topicId}`);
      }
    } catch (error) {
      toast.error("An error occurred while uploading the file");
    } finally {
      setLoading(false);
      setUploadProgress(100); // Process completed (100%)
    }
  };

  const convertFileToBase64 = (
    file: File,
    onProgress: (progress: number) => void
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const base64String = reader.result.split(",")[1];
          if (base64String) {
            resolve(base64String);
          } else {
            reject(new Error("Failed to convert file to base64"));
          }
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = event.loaded / event.total;
          onProgress(progress);
        }
      };
    });
  };

  if (checkingDocument) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Checking for existing document...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload PDF File for Topic</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Select PDF File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={loading}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploadProgress < 100 ? "Processing..." : "Finalizing..."}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
          {loading && <Progress value={uploadProgress} className="w-full" />}
        </form>
      </CardContent>
      <Toaster position="bottom-right" />
    </Card>
  );
}
