"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Upload, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import Search from "../Search/Search";
import { Router } from "next/router";
import { useRouter } from "next/navigation";

type Choice = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  questionId: string;
  text: string;
};

type Question = {
  id: string;
  title: string;
  categoryId: string;
  question: string;
  answer: string[];
  createdAt: Date;
  updatedAt: Date;
  choice: Choice[];
};

export default function AdminDashboard({
  mockQuestions,
  categoryId,
  totalQuestions,
}: {
  mockQuestions: Question[];
  categoryId: string;
  totalQuestions: string;
}) {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
    } else {
      toast.error("Please upload a valid CSV file.");
      setCsvFile(null);
    }
  };

  const handleFileUpload = async () => {
    if (!csvFile) {
      toast.error("No file selected.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", csvFile);
    formData.append("categoryId", categoryId);
    const id = toast.loading("Uploading csv file");
    try {
      const response = await fetch("/api/csvupload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        toast.dismiss(id);
        toast.error("File upload failed");
        return;
      }
      const result = await response.json();
      toast.dismiss(id);
      toast.success(result.message);
      setUploading(false);
    } catch (error) {
      toast.dismiss(id);
      toast.error("Something went wrong while uploading the csv file");
      setUploading(false);
    }
  };
  const router = useRouter();
  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Input
              type="file"
              accept=".csv"
              className="w-full sm:w-auto"
              onChange={handleFileChange}
            />
            <Button
              className="w-full sm:w-auto"
              onClick={handleFileUpload}
              disabled={!csvFile || uploading}
            >
              <Upload className="mr-2 h-4 w-4" /> Upload
            </Button>
          </div>
          <Search />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Questions : {totalQuestions}</CardTitle>
        </CardHeader>
        <CardContent>
          {questions.map((q) => (
            <Card
              key={q.id}
              className="mb-4 cursor-pointer hover:bg-zinc-100"
              onClick={() => toggleExpand(q.id)}
            >
              <CardHeader className="py-2">
                <div className="flex items-center justify-between">
                  <CardTitle
                    className="text-sm font-bold truncate mr-2"
                    onClick={() => {
                      router.push(`/viewtopic/${q.id}`);
                    }}
                  >
                    {q.question}
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleExpand(q.id)}
                  >
                    {expandedId === q.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              {expandedId === q.id && (
                <CardContent>
                  <div className="space-y-2">
                    {q.choice.map((choice, idx) => (
                      <div
                        key={choice.id}
                        className="flex items-center space-x-2"
                      >
                        <Badge
                          variant={
                            q.answer.includes(choice.id)
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs shrink-0"
                        >
                          {String.fromCharCode(65 + idx)}
                        </Badge>
                        <p
                          className={`text-sm ${
                            q.answer.includes(choice.id)
                              ? "font-bold"
                              : "font-medium"
                          }`}
                        >
                          {choice.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
