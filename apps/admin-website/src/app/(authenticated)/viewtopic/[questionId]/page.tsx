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
import { Edit, Save, Trash } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  title: string;
  categoryId: string;
  answer: string[];
  choice: Choice[];
};

export default function QuestionEditor({
  params,
}: {
  params: { questionId: string };
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [questionData, setQuestionData] = useState<QuestionData>({
    id: "",
    question: "",
    title: "",
    categoryId: "",
    answer: [],
    choice: [],
  });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

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
      setQuestionData(data.data);
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
    const loadingId = toast.loading("Loading");
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
      }
      toast.dismiss(loadingId);
      toast.success("Question updated successfully.");
      setIsEditing(false);
    } catch (error) {
      toast.dismiss(loadingId);
      toast.error("Error updating question.");
    }
  };

  const handleDelete = async () => {
    if (!questionData) return;
    try {
      const response = await fetch(`/api/deletequestion/${params.questionId}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to delete question.");
      }

      toast.success("Question deleted successfully.");
      router.push("/");
    } catch (error) {
      toast.error("Error deleting question.");
    }
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestionData((prev) => ({ ...prev, question: e.target.value }));
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
    <div className="flex justify-center items-center h-[700px] w-full">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            {isEditing ? (
              <Input
                value={questionData.question}
                onChange={handleQuestionChange}
                className="text-2xl font-bold"
              />
            ) : (
              questionData.question
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
        <CardFooter>
          {isEditing ? (
            <div className="flex w-full space-x-2">
              <Button
                onClick={handleUpdate}
                className="flex-1 items-center justify-center"
              >
                <Save className="mr-2 h-4 w-4" />
                Update
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="flex-1 items-center justify-center"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleEdit}
              className="w-full items-center justify-center"
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
