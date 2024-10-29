"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
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
import { Edit, Save, Trash, Loader } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

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

const defaultParagraph = `
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<p><strong>Bold text</strong>, <em>italic text</em>, and <u>underlined text</u>.</p>
<p>Normal paragraph with <span style="font-size: 18px;">different</span> <span style="font-size: 24px;">text</span> <span style="font-size: 36px;">sizes</span>.</p>
<ul>
  <li>Bullet point 1</li>
  <li>Bullet point 2</li>
</ul>
<ol>
  <li>Numbered item 1</li>
  <li>Numbered item 2</li>
</ol>
`;

export default function QuestionEditor({
  params,
}: {
  params: { questionId: string };
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [questionData, setQuestionData] = useState<QuestionData>({
    id: "",
    question: "",
    paragraph: defaultParagraph,
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
    const id = toast.loading("fetching question");
    try {
      const response = await fetch(`/api/question/${params.questionId}`);
      if (!response.ok) toast.warning("Failed to fetch question.");
      const data = await response.json();
      if (data.err) {
        toast.dismiss(id);
        toast.info(`${data.msg}`);
        setIsLoading(false);
        return;
      }
      toast.dismiss(id);
      toast.info(`${data.msg}`);
      setQuestionData({
        ...data.data,
        paragraph: data.data.paragraph || defaultParagraph,
      });
      setIsLoading(false);
    } catch (error) {
      toast.dismiss(id);
      toast.error("Error fetching question.");
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

      if (!response.ok) {
        toast.dismiss(loadingId);
        toast.warning("Failed to update question.");
      } else {
        toast.dismiss(loadingId);
        toast.success("Question updated successfully.");
        setIsEditing(false);
      }
    } catch (error) {
      toast.dismiss(loadingId);
      toast.error("Error updating question.");
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

      if (!response.ok) {
        throw new Error("Failed to delete question.");
      }

      toast.dismiss(loadingId);
      toast.success("Question deleted successfully.");
      router.push("/");
    } catch (error) {
      toast.dismiss(loadingId);
      toast.error("Error deleting question.");
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

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ size: ["small", false, "large", "huge"] }],
      ["clean"],
    ],
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
          {/* <div className="space-y-2">
            <Label htmlFor="paragraph">Paragraph:</Label>
            {isEditing ? (
              <div className="border rounded-md">
                <ReactQuill
                  theme="snow"
                  value={questionData.paragraph}
                  onChange={handleParagraphChange}
                  modules={quillModules}
                  className="h-64"
                />
              </div>
            ) : (
              <div
                className="ql-editor border rounded-md p-4"
                dangerouslySetInnerHTML={{ __html: questionData.paragraph }}
              />
            )}
          </div> */}
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
