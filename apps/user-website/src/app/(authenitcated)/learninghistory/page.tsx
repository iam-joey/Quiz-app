"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { XCircle, BookOpen, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

type TopicInfo = {
  id: string;
  name: string;
  pages: number;
};

type UserTopic = {
  topic: TopicInfo;
};

type LearningHistoryItem = {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  userTopics: UserTopic[];
};

export default function Component() {
  const [history, setHistory] = useState<LearningHistoryItem[]>([]);
  const [clickedButtons, setClickedButtons] = useState<{
    [key: string]: boolean;
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const session = useSession();

  const fetchLearningHistory = async () => {
    setIsLoading(true);
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
      console.log("Learning history result:", result);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session.status === "authenticated") {
      fetchLearningHistory();
    }
  }, [session.status]);

  const handleTopicClick = (topicId: string) => {
    setClickedButtons((prev) => ({ ...prev, [topicId]: true }));
    router.push(`/learningTopic/${topicId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-primary">
        Learning History
      </h1>
      {history.length > 0 ? (
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {history.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden border-2 border-primary/10">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg text-primary">
                      Learning Session
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      <XCircle className="w-3 h-3 mr-1" />
                      In Progress
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {item.userTopics.map((userTopic) => (
                      <div
                        key={userTopic.topic.id}
                        className="text-sm text-gray-700 dark:text-gray-300 flex items-center"
                      >
                        <BookOpen className="w-4 h-4 mr-2 text-primary" />
                        {userTopic.topic.name} ({userTopic.topic.pages} pages)
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={() => handleTopicClick(item.id)}
                      variant={
                        clickedButtons[item.id] ? "secondary" : "default"
                      }
                      size="lg"
                      className="text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105"
                      disabled={clickedButtons[item.id]}
                    >
                      {clickedButtons[item.id] ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Reading...
                        </>
                      ) : (
                        "Continue Reading"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.p
          className="text-center text-lg text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          You haven't started any learning topics yet.
        </motion.p>
      )}
    </div>
  );
}
