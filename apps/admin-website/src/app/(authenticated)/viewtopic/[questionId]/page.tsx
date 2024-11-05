"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Save, Trash, Loader, FileText } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import { editParagraph } from "@/src/lib/actions";

type Choice = {
  id: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  questionId: string;
};

type QuestionData = {
  id: string;
  question: string;
  paragraph: string;
  title: string;
  categoryId: string;
  answer: string[];
  choice: Choice[];
};

function ParagraphDialog({
  content,
  onChange,
  isEditing,
  onEdit,
  onSave,
  questionId,
}: {
  content: string;
  onChange: (content: string) => void;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  questionId: string;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await editParagraph(questionId, content);
      if (result.err) {
        toast.error(result.msg);
      } else {
        toast.success(result.msg);
        onSave();
        setDialogOpen(false);
      }
    } catch (error) {
      toast.error("Failed to save paragraph");
    } finally {
      setIsSaving(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "color",
  ];

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <FileText className="mr-2 h-4 w-4" />
          View Paragraph
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-2">
          <DialogTitle>Paragraph</DialogTitle>
          {isEditing ? (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? "Saving..." : "Save"}
            </Button>
          ) : (
            <Button onClick={onEdit}>Edit</Button>
          )}
        </DialogHeader>
        <div className="flex flex-col flex-grow h-full mt-4">
          {isEditing ? (
            <div className="flex-grow" style={{ height: "calc(90vh - 120px)" }}>
              <ReactQuill
                value={content}
                onChange={onChange}
                modules={modules}
                formats={formats}
                theme="snow"
                style={{ height: "100%" }}
              />
            </div>
          ) : (
            <div
              className="prose prose-sm max-w-none dark:prose-invert overflow-y-auto ql-editor custom-quill-content"
              style={{
                height: "calc(90vh - 120px)",
                padding: "1rem",
                backgroundColor: "var(--background)",
                borderRadius: "0.5rem",
              }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default function QuestionEditor({
  params,
}: {
  params: { questionId: string };
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isParagraphEditing, setIsParagraphEditing] = useState(false);
  const [questionData, setQuestionData] = useState<QuestionData>({
    id: "",
    question: "",
    paragraph: "",
    title: "",
    categoryId: "",
    answer: [],
    choice: [],
  });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchQuestion = async () => {
    setIsLoading(true);
    const id = toast.loading("Fetching question");
    try {
      const response = await fetch(`/api/question/${params.questionId}`);
      if (!response.ok) throw new Error("Failed to fetch question");
      const data = await response.json();
      if (data.err) throw new Error(data.msg);
      toast.dismiss(id);
      toast.success(`${data.msg}`);
      setQuestionData({
        ...data.data,
      });
    } catch (error) {
      toast.dismiss(id);
      toast.error(
        error instanceof Error ? error.message : "Error fetching question"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [params.questionId]);

  const handleEdit = () => setIsEditing(true);

  const handleUpdate = async () => {
    if (!questionData) return;
    setIsUpdating(true);
    const loadingId = toast.loading("Updating question");
    try {
      const response = await fetch(`/api/updatequestion/${params.questionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionData),
      });

      if (!response.ok) throw new Error("Failed to update question");
      toast.dismiss(loadingId);
      toast.success("Question updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.dismiss(loadingId);
      toast.error(
        error instanceof Error ? error.message : "Error updating question"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!questionData) return;
    setIsDeleting(true);
    const loadingId = toast.loading("Deleting question");
    try {
      const response = await fetch(`/api/deletequestion/${params.questionId}`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to delete question");
      toast.dismiss(loadingId);
      toast.success("Question deleted successfully");
      router.push("/");
    } catch (error) {
      toast.dismiss(loadingId);
      toast.error(
        error instanceof Error ? error.message : "Error deleting question"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestionData((prev) => ({ ...prev, question: e.target.value }));
  };

  const handleParagraphChange = (content: string) => {
    setQuestionData((prev) => ({ ...prev, paragraph: content }));
  };

  const handleChoiceChange = (id: string, text: string) => {
    setQuestionData((prev) => ({
      ...prev,
      choice: prev.choice.map((choice) =>
        choice.id === id ? { ...choice, text, updatedAt: new Date() } : choice
      ),
    }));
  };

  const handleAnswerChange = (choiceId: string) => {
    setQuestionData((prev) => ({
      ...prev,
      answer: prev.answer.includes(choiceId)
        ? prev.answer.filter((id) => id !== choiceId)
        : [...prev.answer, choiceId],
    }));
  };

  if (isLoading) return <div className="text-center">Loading...</div>;

  return (
    <div className="flex justify-center items-center min-h-screen w-full p-4">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Question Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question">Question:</Label>
            <Input
              id="question"
              value={questionData.question}
              onChange={handleQuestionChange}
              className="w-full"
              disabled={!isEditing}
            />
          </div>
          <ul className="space-y-2">
            {questionData.choice.map((choice) => (
              <li
                key={choice.id}
                className={`p-2 rounded ${
                  questionData.answer.includes(choice.id)
                    ? "bg-green-100 dark:bg-green-800"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`correct-${choice.id}`}
                      checked={questionData.answer.includes(choice.id)}
                      onCheckedChange={() => handleAnswerChange(choice.id)}
                    />
                    <Input
                      value={choice.text}
                      onChange={(e) =>
                        handleChoiceChange(choice.id, e.target.value)
                      }
                      className="flex-grow"
                    />
                  </div>
                ) : (
                  <Label
                    htmlFor={`choice-${choice.id}`}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`choice-${choice.id}`}
                      checked={questionData.answer.includes(choice.id)}
                      disabled
                    />
                    <span>{choice.text}</span>
                  </Label>
                )}
              </li>
            ))}
          </ul>
          <ParagraphDialog
            content={questionData.paragraph}
            onChange={handleParagraphChange}
            isEditing={isParagraphEditing}
            onEdit={() => setIsParagraphEditing(true)}
            onSave={() => setIsParagraphEditing(false)}
            questionId={questionData.id}
          />
        </CardContent>
        <CardFooter className="flex justify-end space-x-2 pt-6">
          {isEditing ? (
            <>
              <Button
                onClick={handleUpdate}
                className="items-center justify-center"
                disabled={isUpdating || isDeleting}
              >
                {isUpdating ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isUpdating ? "Updating..." : "Update"}
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="items-center justify-center"
                disabled={isUpdating || isDeleting}
              >
                {isDeleting ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash className="mr-2 h-4 w-4" />
                )}
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleEdit}
              className="items-center justify-center"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
