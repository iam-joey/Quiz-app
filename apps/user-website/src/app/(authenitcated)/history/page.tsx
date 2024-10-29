"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Trophy,
  ClipboardList,
  User,
  Medal,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { authOptions } from "@/src/lib/auth";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/src/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";

type TopicInfo = {
  name: string;
};

type NormalTest = {
  category: TopicInfo;
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

type Participant = {
  id: number;
  name: string;
  grade: number;
};

const generateMockData = (): Participant[] => {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Participant ${i + 1}`,
    grade: +(Math.random() * 5 + 5).toFixed(2),
  })).sort((a, b) => b.grade - a.grade);
};

const MedalIcon = ({ rank }: { rank: number }) => {
  switch (rank) {
    case 1:
      return <Medal className="w-6 h-6 text-yellow-400" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Medal className="w-6 h-6 text-amber-600" />;
    default:
      return null;
  }
};

export default function TestList() {
  const [test, setTest] = useState<UserTestData>();
  const router = useRouter();
  const [grade, setGrade] = useState<number | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTestHistory, setShowTestHistory] = useState(false);
  const session = useSession();

  const handleTestClick = (
    testId: string,
    isCompleted: boolean,
    testType: string
  ) => {
    if (isCompleted) {
      router.push(`/test/${testId}/results?testType=${testType}`);
      return;
    }
    router.push(`/test/${testId}?type=${testType}`);
  };

  const fetchData = async () => {
    const loadingId = toast.loading("Loading info");
    try {
      const response = await fetch(
        `/api/testhistory/${(session.data?.user as any)?.id}`
      );
      if (!response.ok) {
        toast.dismiss(loadingId);
        toast.error("Failed fetching data");
        return;
      }
      const result = await response.json();
      if (result.err) {
        toast.dismiss(loadingId);
        toast.error(`${result.msg}`);
        return;
      }
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

  useEffect(() => {
    if (session.data?.user?.id) {
      fetchData();
      fetchStats();
    }
  }, [session.data?.user?.id]);

  const participants = generateMockData();

  return (
    <div className="container mx-auto p-4 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {grade && (
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Trophy className="w-12 h-12" />
                <div>
                  <h3 className="text-2xl font-bold">Average Grade</h3>
                  <p className="text-xl">
                    Your average grade is{" "}
                    <span className="font-bold text-3xl">{grade}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center">
                <Trophy className="mr-2 text-yellow-400" /> Leaderboard
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className="transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                {showLeaderboard ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            <AnimatePresence>
              {showLeaderboard && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-semibold mb-4">
                    Top 50 Participants
                  </h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100 dark:bg-gray-800">
                          <TableHead className="w-[100px]">Rank</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead className="text-right">Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {participants.map((participant, index) => (
                          <TableRow
                            key={participant.id}
                            className={`
                              transition-colors
                              ${index < 3 ? "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800" : "hover:bg-gray-100 dark:hover:bg-gray-800"}
                            `}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-2">
                                <MedalIcon rank={index + 1} />
                                <span>{index + 1}</span>
                              </div>
                            </TableCell>
                            <TableCell>{participant.name}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {participant.grade.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center">
                <ClipboardList className="mr-2" /> Test History
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTestHistory(!showTestHistory)}
                className="transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                {showTestHistory ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            <AnimatePresence>
              {showTestHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {test?.UserTestDetail && test.UserTestDetail.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-4">
                        Normal Tests
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {test.UserTestDetail.map((test, index) => (
                          <motion.div
                            key={test.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <Card
                              className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden transform hover:scale-105"
                              onClick={() =>
                                handleTestClick(
                                  test.id,
                                  test.isCompleted,
                                  test.testType
                                )
                              }
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-medium text-lg text-gray-800 dark:text-gray-200">
                                    {test.category?.name}
                                  </h4>
                                  <Badge
                                    variant={
                                      test.isCompleted
                                        ? "success"
                                        : "destructive"
                                    }
                                    className="text-xs"
                                  >
                                    {test.isCompleted ? (
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                    ) : (
                                      <XCircle className="w-3 h-3 mr-1" />
                                    )}
                                    {test.isCompleted
                                      ? "Completed"
                                      : "Incomplete"}
                                  </Badge>
                                </div>
                                <div className="mt-2 mb-3">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Score:{" "}
                                    <span className="font-semibold text-lg">
                                      {test.correctAnswers || "0"}/
                                      {test.numberOfQuestions}
                                    </span>
                                  </p>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatDateTime(test.createdAt)}
                                </div>
                                <div className="flex justify-end mt-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs"
                                  >
                                    View Details
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {test?.SimulationTestDetail &&
                    test.SimulationTestDetail.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold mb-4">
                          Simulation Tests
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {test.SimulationTestDetail.map((test, index) => (
                            <motion.div
                              key={test.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <Card
                                className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden transform hover:scale-105"
                                onClick={() =>
                                  handleTestClick(
                                    test.id,
                                    test.isCompleted,
                                    test.testType
                                  )
                                }
                              >
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-lg text-gray-800 dark:text-gray-200">
                                      Simulation Test
                                    </h4>
                                    <Badge
                                      variant={
                                        test.isCompleted
                                          ? "success"
                                          : "destructive"
                                      }
                                      className="text-xs"
                                    >
                                      {test.isCompleted ? (
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                      ) : (
                                        <XCircle className="w-3 h-3 mr-1" />
                                      )}
                                      {test.isCompleted
                                        ? "Completed"
                                        : "Incomplete"}
                                    </Badge>
                                  </div>
                                  <div className="mt-2 mb-3">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Score:{" "}
                                      <span className="font-semibold text-lg">
                                        {test.correctAnswers}/
                                        {test.numberOfQuestions}
                                      </span>
                                    </p>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatDateTime(test.createdAt)}
                                  </div>
                                  <div className="flex justify-end mt-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-xs"
                                    >
                                      View Details
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                  {(!test?.UserTestDetail ||
                    test.UserTestDetail.length === 0) &&
                    (!test?.SimulationTestDetail ||
                      test.SimulationTestDetail.length === 0) && (
                      <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
                        You haven't participated in any tests yet.
                      </p>
                    )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
