"use client";

import React, { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { FlagIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { authOptions } from "@/src/lib/auth";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Question {
  id: string;
  question: string;
  choice: { id: string; text: string }[];
  answer: string[];
}

interface TestResult {
  correctAnswers: number;
  score: number;
  incorrectAnswers: number;
  totalTimeTaken: number;
  accuracy: number;
  userAnswers: string[][];
  question: Question[];
  percentage: number;
}

interface SimulationTestResult {
  isCompleted: boolean;
  singleQuestion: Array<{
    id: string;
    title: string;
    choice: Array<{
      id: string;
      text: string;
    }>;
    answer: string[];
  }>;
  multipleQuestion: Array<{
    id: string;
    title: string;
    choice: Array<{
      id: string;
      text: string;
    }>;
    answer: string[];
  }>;
  userAnswers: string[][];
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalTimeTaken: number;
  accuracy: number;
  createdAt: string;
  percentage: number;
}

export interface TestResultsProps {
  testId: string;
  testType: string;
}

const TestResults: React.FC<TestResultsProps> = ({ testId, testType }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [simulationTestResult, setSimulationTestResult] =
    useState<SimulationTestResult | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null
  );
  const [feedback, setFeedback] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  //@ts-ignore
  const session = useSession(authOptions);
  console.log("simulation test result", simulationTestResult);
  useEffect(() => {
    const fetchTestData = async () => {
      console.log("Results page");
      console.log("testId", testId);
      console.log("testType", testType);
      try {
        setIsLoading(true);
        const response = await fetch(`/api/test/${testId}/${testType}`);
        const data = await response.json();
        console.log("data", data);
        if (data.err) {
          throw new Error(data.msg);
        }

        // Check if the returned data matches the expected test type
        if (data.data.testType && data.data.testType !== testType) {
          console.warn(
            `Mismatch in test types. Expected: ${testType}, Received: ${data.data.testType}`
          );
          // Handle the mismatch (e.g., update the UI or fetch the correct data)
          // For now, we'll update the testType to match the received data
          testType = data.data.testType;
        }

        if (testType === "TIMER" || testType === "NOTIMER") {
          console.log("Timer test result");

          const {
            question,
            userAnswers,
            score,
            correctAnswers,
            incorrectAnswers,
            totalTimeTaken,
            accuracy,
            percentage,
          } = data.data;
          console.log("question", question);

          setTestResult({
            correctAnswers,
            score,
            incorrectAnswers,
            totalTimeTaken,
            accuracy,
            userAnswers,
            question,
            percentage,
          });

          console.log("testResult", testResult);

          setQuestions(question);
          console.log("questions set:", question);
        } else if (testType === "SIMULATION") {
          setSimulationTestResult(data.data);
        }

        console.log("TestResult", testResult);
        console.log("SimulationTestResult", simulationTestResult);
        toast.success("Test results loaded successfully!");
      } catch (error) {
        console.error("Failed to load test results:", error);
        toast.error("Failed to load test results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestData();
  }, [testId, testType]);

  // New useEffect to log testResult when it changes
  useEffect(() => {
    if (testResult) {
      console.log("testResult", testResult);
    }
  }, [testResult]);

  const handleFlagClick = (questionId: string) => {
    console.log("session", session);
    console.log("questionId", questionId);
    setSelectedQuestionId(questionId);
    setFeedback("");
    dialogRef.current?.showModal();
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const requestBody = {
        questionId: selectedQuestionId,
        flagReason: feedback,
        userId: (session.data?.user as any)?.id,
      };
      console.log("Sending flag request:", requestBody);

      const response = await fetch("/api/flag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Flag response:", data);

      if (!response.ok || data.error) {
        throw new Error(data.msg || "Failed to submit flag");
      }

      toast.success("Question flagged successfully!");
      dialogRef.current?.close();
    } catch (error) {
      console.error("Error flagging question:", error);
      toast.error(
        `Failed to flag question: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"></div>
        <div className="text-center mt-4 text-xl font-semibold">
          Loading test results...
        </div>
      </div>
    );
  }

  if (!testResult && !simulationTestResult) {
    return <div className="text-center mt-8">No test results available.</div>;
  }

  return (
    <TooltipProvider>
      {/* Wrap your entire component with TooltipProvider */}
      <div className="flex justify-between items-start max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
        <div className="flex-grow max-w-3xl mx-auto">
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Test Results</h2>
            {(testType === "TIMER" || testType === "NOTIMER") && testResult && (
              <>
                <p>Total Questions: {testResult.question.length}</p>
                <p>Correct Answers: {testResult.correctAnswers}</p>
                <p>Percentage: {testResult.percentage}%</p>
                <div className="mt-6">
                  {testResult.question.map((question, index) => (
                    <div
                      key={question.id}
                      className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg relative"
                    >
                      <h3 className="text-xl font-semibold mb-2">
                        Question {index + 1}
                      </h3>
                      <p className="mb-2">{question.question}</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FlagIcon
                            className="h-6 w-6 absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
                            onClick={() => handleFlagClick(question.id)}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
                          <p>Report to admin</p>
                        </TooltipContent>
                      </Tooltip>
                      <div className="space-y-2">
                        {question.choice.map((choice) => (
                          <div
                            key={choice.id}
                            className={`p-2 rounded ${
                              question.answer.includes(choice.id)
                                ? "bg-green-200 dark:bg-green-700"
                                : testResult.userAnswers[index]?.includes(
                                      choice.id
                                    )
                                  ? "bg-red-200 dark:bg-red-700"
                                  : "bg-white dark:bg-gray-700"
                            }`}
                          >
                            {choice.text}
                            {question.answer.includes(choice.id) && " ✓"}
                            {testResult.userAnswers[index]?.includes(
                              choice.id
                            ) &&
                              !question.answer.includes(choice.id) &&
                              " ✗"}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {testType === "SIMULATION" && simulationTestResult && (
              <>
                <p>
                  Total Questions:{" "}
                  {simulationTestResult.singleQuestion.length +
                    simulationTestResult.multipleQuestion.length}
                </p>
                <p>Percentage: {simulationTestResult.percentage} %</p>
                <p>Correct Answers: {simulationTestResult.correctAnswers}</p>
                {/* <p>Score: {simulationTestResult.score.toFixed(2)}%</p>
                <p>Accuracy: {simulationTestResult.accuracy.toFixed(2)}%</p>
                <p>
                  Total Time Taken: {simulationTestResult.totalTimeTaken}{" "}
                  seconds
                </p> */}
                <div className="mt-6">
                  {simulationTestResult.singleQuestion.map(
                    (question, index) => (
                      <div
                        key={`${question.id}`}
                        className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg relative"
                      >
                        {/* <h1>{question.id.toString()}</h1> */}
                        <h3 className="text-xl font-semibold mb-2">
                          Question {index + 1} (Single)
                        </h3>
                        <p className="mb-2">{question.title}</p>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <FlagIcon
                              className="h-6 w-6 absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
                              onClick={() => handleFlagClick(`${question.id}`)}
                            />
                          </TooltipTrigger>
                          <TooltipContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
                            <p>Report to admin</p>
                          </TooltipContent>
                        </Tooltip>
                        <div className="space-y-2">
                          {question.choice.map((choice) => (
                            <div
                              key={choice.id}
                              className={`p-2 rounded ${
                                question.answer.includes(choice.id)
                                  ? "bg-green-200 dark:bg-green-700"
                                  : simulationTestResult.userAnswers[
                                        index
                                      ]?.includes(choice.id)
                                    ? "bg-red-200 dark:bg-red-700"
                                    : "bg-white dark:bg-gray-700"
                              }`}
                            >
                              {choice.text}
                              {question.answer.includes(choice.id) && " ✓"}
                              {simulationTestResult.userAnswers[
                                index
                              ]?.includes(choice.id) &&
                                !question.answer.includes(choice.id) &&
                                " ✗"}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                  {simulationTestResult.multipleQuestion.map(
                    (question, index) => (
                      <div
                        key={`${question.id}`}
                        className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg relative"
                      >
                        {/* <h1>{question.id}</h1> */}
                        <h3 className="text-xl font-semibold mb-2">
                          Question{" "}
                          {simulationTestResult.singleQuestion.length +
                            index +
                            1}{" "}
                          (Multiple)
                        </h3>
                        <p className="mb-2">{question.title}</p>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <FlagIcon
                              className="h-6 w-6 absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
                              onClick={() => handleFlagClick(`${question.id}`)}
                            />
                          </TooltipTrigger>
                          <TooltipContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
                            <p>Report to admin</p>
                          </TooltipContent>
                        </Tooltip>
                        <div className="space-y-2">
                          {question.choice.map((choice) => (
                            <div
                              key={choice.id}
                              className={`p-2 rounded ${
                                question.answer.includes(choice.id)
                                  ? "bg-green-200 dark:bg-green-700"
                                  : simulationTestResult.userAnswers[
                                        simulationTestResult.singleQuestion
                                          .length + index
                                      ]?.includes(choice.id)
                                    ? "bg-red-200 dark:bg-red-700"
                                    : "bg-white dark:bg-gray-700"
                              }`}
                            >
                              {choice.text}
                              {question.answer.includes(choice.id) && " ✓"}
                              {simulationTestResult.userAnswers[
                                simulationTestResult.singleQuestion.length +
                                  index
                              ]?.includes(choice.id) &&
                                !question.answer.includes(choice.id) &&
                                " ✗"}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <dialog
        ref={dialogRef}
        className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800 max-w-md w-full"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Submit Feedback
        </h3>
        <form onSubmit={handleSubmitFeedback}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full h-32 p-2 border rounded-md mb-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Enter your feedback here..."
            required
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </dialog>
    </TooltipProvider>
  );
};

export default TestResults;
