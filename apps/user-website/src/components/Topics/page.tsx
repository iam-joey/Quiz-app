"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { authOptions } from "@/src/lib/auth";
import { toast } from "sonner";
import { useLearningTopic } from '@/components/context/LearningTopicContext';


export default function Topics() {
  const [searchTerm, setSearchTerm] = useState("");
  //@ts-ignore
  const session = useSession(authOptions);
  const [topics, setTopics] = useState<Array<{ id: string; name: string; pages: number }>>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isStartingStudy, setIsStartingStudy] = useState(false);
  const { learningTopicData, setLearningTopicData } = useLearningTopic();
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [existingProgressId, setExistingProgressId] = useState<string | null>(null);
  const [isResettingStudy, setIsResettingStudy] = useState(false);
  const [showLearningTopicsDialog, setShowLearningTopicsDialog] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/learningtopic");
      const data = await response.json();
      if (!data.err) {
        setTopics(data.data);
      } else {
        toast.error("Failed to fetch topics");
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
      toast.error("An error occurred while fetching topics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setLearningTopicData(null);
    // Clear all learning-related data from local storage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('testData_') ||
          key.startsWith('simulationTestData_') ||
          key.startsWith('testProgress_') ||
          key === 'currentPageNumber' ||
          key === 'currentTopicId' ||
          key === 'currentTopicIndex' ||
          key === 'lastActiveTopicIndex' ||
          key === 'lastSavedTime' ||
          key === 'learningTopicState' ||
          key === 'topicsData' ||
          key === 'topicsOrder' ||
          key === 'topicsProgress' ||
          key === 'nextauth.message') {
        localStorage.removeItem(key);
      }
    });
  }, []);

  useEffect(() => {
    fetchTopics();
  }, []);

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const toggleAllTopics = () => {
    if (selectedTopics.length === filteredTopics.length) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics(filteredTopics.map(topic => topic.id));
    }
  };

  const startStudy = async () => {
    if (selectedTopics.length === 0) return;

    const userId = (session.data?.user as any)?.id;

    if (!userId) {
      toast.error("User not logged in");
      return;
    }

    setIsStartingStudy(true);

    try {
      const response = await fetch(`/api/createuserlearning/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topics: selectedTopics }),
      });

      const result = await response.json();
      console.log("result", result);

      if (result.data.new) {
        console.log("result.data", result.data);
        // Store the complete response data in context
        setLearningTopicData(result.data);
        
        router.push(`/learningTopic/${result.data.id}`);
        toast.success(`Started study for ${selectedTopics.length} topic(s)`);
      } else {
        setLearningTopicData(result.data);
        setExistingProgressId(result.data.id);
        setShowContinueDialog(true);
      }
    } catch (error) {
      console.error("Error starting study:", error);
      toast.error("An error occurred while starting study");
    } finally {
      setIsStartingStudy(false);
    }
  };

  const continueExistingStudy = () => {
    if (existingProgressId) {
      router.push(`/learningTopic/${existingProgressId}`);
      toast.success(`Continued study for ${selectedTopics.length} topic(s)`);
    }
    setShowContinueDialog(false);
  };

  const startNewStudy = async () => {
    if (!existingProgressId) return;

    const userId = (session.data?.user as any)?.id;
    if (!userId) {
      toast.error("User not logged in");
      return;
    }

    setIsResettingStudy(true);

    try {
      // Create a deep copy of the learning topic data
      const updatedLearningTopicData = JSON.parse(JSON.stringify(learningTopicData));
      
      // Update the current page to 1 for all topics in the context
      if (updatedLearningTopicData?.userTopics) {
        updatedLearningTopicData.userTopics = updatedLearningTopicData.userTopics.map((userTopic: any) => ({
          ...userTopic,
          currentPage: 1
        }));
      }

      // Update the API
      const resetPromises = (learningTopicData as any).userTopics.map(async (userTopic: any) => {
        const resetResponse = await fetch(`/api/updatecurrentpage/${userId}/${existingProgressId}/${userTopic.topic.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ page: 1 }),
        });

        if (!resetResponse.ok) {
          throw new Error(`Failed to reset progress for topic ${userTopic.topic.id}`);
        }
      });

      await Promise.all(resetPromises);

      // Update the context with the reset data
      setLearningTopicData(updatedLearningTopicData);

      router.push(`/learningTopic/${existingProgressId}`);
      toast.success(`Started new study for ${selectedTopics.length} topic(s)`);
    } catch (error) {
      console.error('Error resetting study progress:', error);
      toast.error("An error occurred while resetting study progress");
    } finally {
      setIsResettingStudy(false);
    }

    setShowContinueDialog(false);
  };


  return (
    <div className="p-8">
      {showContinueDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full relative">
            <h2 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
              Existing Study Session Found
            </h2>
            <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
              Do you want to continue the existing study or start from the beginning?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={continueExistingStudy}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                disabled={isResettingStudy}
              >
                Continue
              </button>
              <button
                onClick={startNewStudy}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center"
                disabled={isResettingStudy}
              >
                {isResettingStudy ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting...
                  </>
                ) : (
                  'Start from Beginning'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
        Learning Topics
      </h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <>
          <input
            type="text"
            placeholder="Search topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 mb-4 text-lg rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
          />
          <div className="space-y-3 max-h-60 overflow-y-auto">
            <button
              onClick={toggleAllTopics}
              className={`w-full px-4 py-3 text-left text-lg rounded-md transition duration-200 ease-in-out flex justify-between items-center ${
                selectedTopics.length === filteredTopics.length
                  ? "bg-blue-100 dark:bg-blue-700 text-black dark:text-white font-semibold"
                  : "text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-800"
              }`}
            >
              <span>Select All</span>
              {selectedTopics.length === filteredTopics.length && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-500 dark:text-blue-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
            {filteredTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => toggleTopic(topic.id)}
                className={`w-full px-4 py-3 text-left text-lg rounded-md transition duration-200 ease-in-out flex justify-between items-center ${
                  selectedTopics.includes(topic.id)
                    ? "bg-blue-100 dark:bg-blue-700 text-black dark:text-white font-semibold"
                    : "text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-800"
                }`}
              >
                <span>{topic.name} ({topic.pages} pages)</span>
                {selectedTopics.includes(topic.id) && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-500 dark:text-blue-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={startStudy}
            className={`mt-8 w-full px-4 py-3 rounded-md transition duration-200 ease-in-out flex items-center justify-center ${
              selectedTopics.length > 0 && !isStartingStudy
                ? "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                : "bg-blue-200 text-blue-400 dark:bg-blue-300 dark:text-blue-500 cursor-not-allowed"
            }`}
            disabled={selectedTopics.length === 0 || isStartingStudy}
          >
            {isStartingStudy ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Starting Study...
              </>
            ) : (
              `Start Study (${selectedTopics.length} selected)`
            )}
          </button>
        </>
      )}
    </div>
  );
}
