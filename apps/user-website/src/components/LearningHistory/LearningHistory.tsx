"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface LearningHistoryProps {
  userId: string;
}

export function LearningHistory({ userId }: LearningHistoryProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/learninghistory/${userId}`);
        const data = await response.json();
        setHistory(data.data);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  if (isLoading) {
    return <div>Loading history...</div>;
  }

  return (
    <div className="space-y-4">
      {history.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No learning history available.</p>
      ) : (
        history.map((item: any) => (
          <div
            key={item.id}
            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/learningTopic/${item.id}`)}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium dark:text-white">{item.name}</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>Progress: {item.progress}%</span>
                <span>Topics: {item.topicsCount}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
} 