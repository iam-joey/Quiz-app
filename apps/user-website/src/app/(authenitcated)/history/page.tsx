"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { authOptions } from "@/src/lib/auth";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/src/lib/utils";

type NormalTest = {
  category: {
    name: string;
  };
  correctAnswers: number | null;
  id: string;
  isCompleted: boolean;
  numberOfQuestions: number;
  testType: "TIMER" | "NOTIMER";
  createdAt: string;
};

type SimulationTest = {
  correctAnswers: number;
  id: string;
  isCompleted: boolean;
  numberOfQuestions: number;
  testType: "SIMULATION";
  createdAt: string;
};

interface UserTestData {
  SimulationTestDetail: SimulationTest[];
  UserTestDetail: NormalTest[];
}

type LearningHistoryItem = {
  id: string;
  currentPage: number;
  completedAt: string | null;
  document: {
    id: string;
    fileName: string;
    totalPages: number;
  };
  topic: {
    id: string;
    name: string;
  };
};

export default function History() {
  const [test, setTest] = useState<UserTestData>();
  const [learningHistory, setLearningHistory] = useState<LearningHistoryItem[]>([]);
  const router = useRouter();
  const [grade, setGrade] = useState<number | null>(null);
  //@ts-ignore
  const session = useSession(authOptions);

  const handleTestClick = (
    testId: string,
    isCompleted: boolean,
    testType: string
  ) => {
    console.log("testype", testType);
    if (isCompleted) {
      router.push(`/test/${testId}/results?testType=${testType}`);
      return;
    }
    router.push(`/test/${testId}?type=${testType}`);
  };

  const fetchTestData = async () => {
    const loadingId = toast.loading("Loading info");
    try {
      const response = await fetch(
        `/api/testhistory/${(session.data?.user as any)?.id}`
      );
      console.log("response", response);
      if (!response.ok) {
        toast.dismiss(loadingId);
        toast.error("Failed fetching data");
        return;
      }
      const result = await response.json();
      console.log("result", result);
      if (result.err) {
        toast.dismiss(loadingId);
        toast.error(`${result.msg}`);
        return;
      }
      console.log("fetching the results", result.data);
      setTest(result.data);
      toast.dismiss(loadingId);
      toast.success(`${result.msg}`);
    } catch (error) {
      toast.dismiss(loadingId);
      toast.error("An error occurred while fetching data");
    }
  };

  const fetchStats = async () => {
    const loadingId = toast.loading("Loading info");
    try {
      const response = await fetch(
        `/api/stats/${(session.data?.user as any)?.id}`
      );
      const data = await response.json();
      console.log("data", data);
      toast.dismiss(loadingId);
      if (data.error) {
        toast.error(data.msg);
        return;
      }
      toast.success(data.msg);
      setGrade(data.data.grade);
    } catch (error) {
      toast.dismiss(loadingId);
      toast.error("An error occurred while fetching data");
    }
  };

  const fetchLearningHistory = async () => {
    const loadingId = toast.loading("Loading learning history...");
    try {
      const userId = (session.data?.user as any)?.id;
      if (!userId) {
        toast.dismiss(loadingId);
        toast.error("User not authenticated");
        return;
      }

      const response = await fetch(`/api/learninghistory/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch learning history");
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.message);
      }

      setLearningHistory(result.data);
      toast.dismiss(loadingId);
      toast.success("Learning history loaded successfully");
    } catch (error) {
      toast.dismiss(loadingId);
      toast.error("An error occurred while fetching learning history");
      console.error("Error fetching learning history:", error);
    }
  };

  useEffect(() => {
    //@ts-ignore
    if (session.data?.user?.id) {
      fetchTestData();
      fetchStats();
      fetchLearningHistory();
    }
    //@ts-ignore
  }, [session.data?.user?.id]);

  const handleTopicClick = (topicId: string) => {
    router.push(`/learningTopic/${topicId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">History</h1>

      {/* Test History Section */}
      <h2 className="text-xl font-semibold mb-4">Test History</h2>
      {test?.UserTestDetail && test.UserTestDetail.length > 0 ? (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Normal Tests</h2>
          {grade && (
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Average Grade
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your average grade is{" "}
                  <span className="font-semibold">{grade}</span>
                </p>
              </div>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {test.UserTestDetail.map((test) => (
              <Card
                key={test.id}
                className="cursor-pointer hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden"
                onClick={() =>
                  handleTestClick(test.id, test.isCompleted, test.testType)
                }
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">
                      {test.category?.name}
                    </h3>
                    <Badge
                      //@ts-ignore
                      variant={test.isCompleted ? "success" : "destructive"}
                      className="text-xs"
                    >
                      {test.isCompleted ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {test.isCompleted ? "Completed" : "Incomplete"}
                    </Badge>
                  </div>
                  <div className="mt-2 mb-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Score:{" "}
                      <span className="font-semibold">
                        {test.correctAnswers || "0"}/{test.numberOfQuestions}
                      </span>
                    </p>
                  </div>
                  <div>{formatDateTime(test.createdAt)}</div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-400">
          You haven't participated in any normal tests.
        </p>
      )}

      {test?.SimulationTestDetail && test.SimulationTestDetail.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold mb-4">Simulation Tests</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {test.SimulationTestDetail.map((test) => (
              <Card
                key={test.id}
                className="cursor-pointer hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden"
                onClick={() =>
                  handleTestClick(test.id, test.isCompleted, test.testType)
                }
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">
                      {"Simulation Test"}
                    </h3>
                    <Badge
                      //@ts-ignore
                      variant={test.isCompleted ? "success" : "destructive"}
                      className="text-xs"
                    >
                      {test.isCompleted ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {test.isCompleted ? "Completed" : "Incomplete"}
                    </Badge>
                  </div>
                  <div className="mt-2 mb-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Score:{" "}
                      <span className="font-semibold">
                        {test.correctAnswers}/{test.numberOfQuestions}
                      </span>
                    </p>
                  </div>
                  <div>{formatDateTime(test.createdAt)}</div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
          You haven't participated in any simulation tests.
        </p>
      )}

      {/* Learning History Section */}
      <h2 className="text-xl font-semibold mb-4 mt-8">Learning History</h2>
      {learningHistory.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {learningHistory.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden"
              onClick={() => handleTopicClick(item.topic.id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">
                    {item.topic.name}
                  </h3>
                  <Badge
                    variant={item.completedAt ? "success" : "default"}
                    className="text-xs"
                  >
                    {item.completedAt ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {item.completedAt ? "Completed" : "In Progress"}
                  </Badge>
                </div>
                <div className="mt-2 mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Progress:{" "}
                    <span className="font-semibold">
                      {item.currentPage}/{item.document.totalPages}
                    </span>
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {item.completedAt
                    ? `Completed: ${formatDateTime(item.completedAt)}`
                    : `Last accessed: ${formatDateTime(item.updatedAt)}`}
                </div>
                <div className="flex justify-end mt-2">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Continue Reading
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-400">
          You haven't started any learning topics yet.
        </p>
      )}
    </div>
  );
}
