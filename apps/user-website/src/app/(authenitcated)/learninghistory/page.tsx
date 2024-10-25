"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { formatDateTime } from "@/src/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

export default function LearningHistory() {
  const [history, setHistory] = useState<LearningHistoryItem[]>([]);
  const router = useRouter();
  const session = useSession();

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

      setHistory(result.data);
      toast.dismiss(loadingId);
      toast.success("Learning history loaded successfully");
    } catch (error) {
      toast.dismiss(loadingId);
      toast.error("An error occurred while fetching learning history");
      console.error("Error fetching learning history:", error);
    }
  };

  useEffect(() => {
    if (session.status === "authenticated") {
      fetchLearningHistory();
    }
  }, [session.status]);

  const handleTopicClick = (topicId: string) => {
    router.push(`/learningTopic/${topicId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Learning History</h1>
      {history.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {history.map((item) => (
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
                {/* <div className="text-xs text-gray-500">
                  {item.completedAt
                    ? `Completed: ${formatDateTime(item.completedAt)}`
                    : `Last accessed: ${formatDateTime(item.updatedAt)}`}
                </div> */}
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