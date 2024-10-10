"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

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
}

interface SimulationTestResult {
  isCompleted: boolean;
    singleQuestion: Array<{
    title: string;
    choice: Array<{
      id: string;
      text: string;
    }>;
    answer: string[];
  }>;
  multipleQuestion: Array<{
    question: string;
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
}

export interface TestResultsProps {
  testId: string;
  testType: string;
}

const TestResults: React.FC<TestResultsProps> = ({ testId, testType }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [simulationTestResult, setSimulationTestResult] = useState<SimulationTestResult | null>(null);
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
        if(testType === "TIMER" || testType === "NOTIMER") {
        const { question, userAnswers, score, correctAnswers, incorrectAnswers, totalTimeTaken, accuracy } = data.data;
        setQuestions(question);

        setTestResult({
          correctAnswers,
          score,
          incorrectAnswers,
          totalTimeTaken,
          accuracy,
          userAnswers,
          question
        });
        } else if(testType === "SIMULATION") {
          setSimulationTestResult(data.data);
        }

        toast.success("Test results loaded successfully!");
      } catch (error) {
        console.error("Failed to load test results:", error);
        toast.error("Failed to load test results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestData();
  }, [testId]);

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
    <div className="flex justify-center">
      <div className="max-w-3xl w-full px-4">
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Test Results</h2>
          {testType === "TIMER" || testType === "NOTIMER" && testResult && (
            <>
              <p>Total Questions: {testResult.question.length}</p>
              <p>Correct Answers: {testResult.correctAnswers}</p>
              <p>Score: {testResult.score.toFixed(2)}%</p>
              <div className="mt-6">
                {testResult.question.map((question, index) => (
                  <div
                    key={question.id}
                    className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  >
                    <h3 className="text-xl font-semibold mb-2">
                      Question {index + 1}
                    </h3>
                    <p className="mb-2">{question.question}</p>
                    <div className="space-y-2">
                      {question.choice.map((choice) => (
                        <div
                          key={choice.id}
                          className={`p-2 rounded ${
                            question.answer.includes(choice.id)
                              ? "bg-green-200 dark:bg-green-700"
                              : testResult.userAnswers[index]?.includes(choice.id)
                                ? "bg-red-200 dark:bg-red-700"
                                : "bg-white dark:bg-gray-700"
                          }`}
                        >
                          {choice.text}
                          {question.answer.includes(choice.id) && " ✓"}
                          {testResult.userAnswers[index]?.includes(choice.id) &&
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
              <p>Total Questions: {simulationTestResult.singleQuestion.length + simulationTestResult.multipleQuestion.length}</p>
              <p>Correct Answers: {simulationTestResult.correctAnswers}</p>
              <p>Score: {simulationTestResult.score.toFixed(2)}%</p>
              <p>Accuracy: {simulationTestResult.accuracy.toFixed(2)}%</p>
              <p>Total Time Taken: {simulationTestResult.totalTimeTaken} seconds</p>
              <div className="mt-6">
                {simulationTestResult.singleQuestion.map((question, index) => (
                  <div
                    key={`single-${index}`}
                    className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  >
                    <h3 className="text-xl font-semibold mb-2">
                      Question {index + 1} (Single)
                    </h3>
                    <p className="mb-2">{question.title}</p>
                    <div className="space-y-2">
                      {question.choice.map((choice) => (
                        <div
                          key={choice.id}
                          className={`p-2 rounded ${
                            question.answer.includes(choice.id)
                              ? "bg-green-200 dark:bg-green-700"
                              : simulationTestResult.userAnswers[index]?.includes(choice.id)
                                ? "bg-red-200 dark:bg-red-700"
                                : "bg-white dark:bg-gray-700"
                          }`}
                        >
                          {choice.text}
                          {question.answer.includes(choice.id) && " ✓"}
                          {simulationTestResult.userAnswers[index]?.includes(choice.id) &&
                            !question.answer.includes(choice.id) &&
                            " ✗"}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {simulationTestResult.multipleQuestion.map((question, index) => (
                  <div
                    key={`multiple-${index}`}
                    className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  >
                    <h3 className="text-xl font-semibold mb-2">
                      Question {simulationTestResult.singleQuestion.length + index + 1} (Multiple)
                    </h3>
                    <p className="mb-2">{question.question}</p>
                    <div className="space-y-2">
                      {question.choice.map((choice) => (
                        <div
                          key={choice.id}
                          className={`p-2 rounded ${
                            question.answer.includes(choice.id)
                              ? "bg-green-200 dark:bg-green-700"
                              : simulationTestResult.userAnswers[simulationTestResult.singleQuestion.length + index]?.includes(choice.id)
                                ? "bg-red-200 dark:bg-red-700"
                                : "bg-white dark:bg-gray-700"
                          }`}
                        >
                          {choice.text}
                          {question.answer.includes(choice.id) && " ✓"}
                          {simulationTestResult.userAnswers[simulationTestResult.singleQuestion.length + index]?.includes(choice.id) &&
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
        </div>
      </div>
    </div>
  );
};

export default TestResults;
