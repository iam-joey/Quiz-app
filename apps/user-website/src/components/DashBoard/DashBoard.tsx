"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { authOptions } from "@/src/lib/auth";
import axios from "axios";
import { toast } from "sonner";
import { useTestContext } from "@/components/context/TestContext";
import { useSimulationTestContext } from "@/components/context/SimulationTestContext";

export default function Home() {
  const router = useRouter();
  //@ts-ignore
  const session = useSession(authOptions);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showQuestionCountDialog, setShowQuestionCountDialog] = useState(false);
  const [questionCount, setQuestionCount] = useState<number | null>(null);
  const [showTimerDialog, setShowTimerDialog] = useState(false);
  const [isTimedTest, setIsTimedTest] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState("Tests");
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; questionCount: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTimeSettingDialog, setShowTimeSettingDialog] = useState(false);
  const [testDuration, setTestDuration] = useState<number | null>(null);
  const [showExamSimulationDialog, setShowExamSimulationDialog] =
    useState(false);
  const [customTime, setCustomTime] = useState<number | null>(null);
  const [customTimeUnit, setCustomTimeUnit] = useState<
    "hours" | "minutes" | "seconds"
  >("hours");
  const [isStartingTest, setIsStartingTest] = useState(false);
  const questionOptions = [25, 50, 75];
  const timeOptions = [1, 2, 3, 4];
  const { setTestData } = useTestContext();
  const { setSimulationTestData } = useSimulationTestContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [maxQuestionCount, setMaxQuestionCount] = useState<number | null>(null);
  const [showLearningTopicsDialog, setShowLearningTopicsDialog] = useState(false);
  const [topics, setTopics] = useState<Array<{ id: string; name: string; document: { totalPages: number } }>>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    setTestData(null);
    setSimulationTestData(null);

    // // Clear all test-related data from local storage
    // Object.keys(localStorage).forEach(key => {
    //   if (key.startsWith('testData_') ||
    //       key.startsWith('simulationTestData_') ||
    //       key.startsWith('testProgress_')) {
    //     localStorage.removeItem(key);
    //   }
    // });

    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categorys", {
          method: "GET",
          headers: {
            "Cache-Control": "no-store",
          },
        });
        const data = await response.json();
        console.log("response", response);
        if (data.err === false) {
          setCategories(data.data);
        } else {
          setError("Failed to fetch categories");
        }
      } catch (error) {
        setError("An error occurred while fetching categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const startTest = async (isExamSimulation = false) => {
    setIsStartingTest(true);
    let testConfig = {
      userId: (session.data?.user as any)?.id,
      isTimed: isTimedTest !== null ? isTimedTest : true,
      duration: testDuration ? Math.round(testDuration * 3600) : 0,
      numberOfQuestions: questionCount || 0,
      categoryId: isExamSimulation
        ? "112d8622-e0f7-4099-a422-a9a3ad4220c1"
        : selectedCategory || "",
      testType: isExamSimulation
        ? "SIMULATION"
        : isTimedTest
          ? "TIMER"
          : "NOTIMER",
    };

    if (isExamSimulation) {
      testConfig = {
        ...testConfig,
        isTimed: true,
        duration: 4 * 3600,
        numberOfQuestions: 200,
      };
    }

    if (!testConfig.userId) {
      console.error("User ID not found in session data");
      toast.warning("Login again to fix this issue");
      return;
    }

    console.log("testConfig", testConfig);

    try {
      const response = await axios.post("/api/createtest", testConfig);

      console.log("response", response);

      if (!response.data.err) {
        const testData = response.data.data;
        const testDataWithIsCompleted = { ...testData, isCompleted: false };

        if (isExamSimulation) {
          setSimulationTestData(testDataWithIsCompleted);
          localStorage.setItem(
            `simulationTestData_${testData.id}`,
            JSON.stringify(testDataWithIsCompleted)
          );
        } else {
          setTestData(testDataWithIsCompleted);
          localStorage.setItem(
            `testData_${testData.id}`,
            JSON.stringify(testDataWithIsCompleted)
          );
        }

        router.push(`/test/${testData.id}?type=${testConfig.testType}`);
      } else {
        console.error("Failed to create test:", response.data.msg);
        toast.error(
          response.data.msg || "Failed to create test. Please try again."
        );
      }
    } catch (error) {
      console.error("Error creating test:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsStartingTest(false);
    }
  };

  const updateTestDuration = () => {
    if (customTime === null) return;

    let durationInHours: number;
    switch (customTimeUnit) {
      case "hours":
        durationInHours = customTime;
        break;
      case "minutes":
        durationInHours = customTime / 60;
        break;
      case "seconds":
        durationInHours = customTime / 3600;
        break;
    }
    setTestDuration(durationInHours);
  };

  useEffect(() => {
    updateTestDuration();
  }, [customTime, customTimeUnit]);

  // Add this function to filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchTopics = async () => {
    try {
      const response = await fetch("/api/learningtopic");
      const data = await response.json();
      console.log("data", data);
      if (!data.err) {
        setTopics(data.data);
      } else {
        toast.error("Failed to fetch topics");
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
      toast.error("An error occurred while fetching topics");
    }
  };

  useEffect(() => {
    if (showLearningTopicsDialog) {
      fetchTopics();
    }
  }, [showLearningTopicsDialog]);

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startStudy = async () => {
    if (!selectedTopic) return;

    const userId = (session.data?.user as any)?.id; // Assuming user ID is available in session

    if (!userId) {
      toast.error("User not logged in");
      return;
    }

    try {
      const response = await fetch(`/api/createuserlearning/${userId}/${selectedTopic}`, {
        method: "POST",
      });

      const result = await response.json();
      console.log("result", result);

      router.push(`/learningTopic/${selectedTopic}`);
      if (result.error) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
        router.push(`/learningTopic/${selectedTopic}`);
      }
    } catch (error) {
      console.error("Error starting study:", error);
      toast.error("An error occurred while starting study");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white p-4">
      <div className="w-full max-w-3xl">
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab("Tests")}
            className={`flex-1 py-2 text-center ${
              activeTab === "Tests"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Tests
          </button>
          <button
            onClick={
              () => toast.info("Coming soon")
              //setActiveTab("Flashcards")
            }
            className={`flex-1 py-2 text-center ${
              activeTab === "Flashcards"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Learnings
          </button>
        </div>

        {activeTab === "Tests" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <h2 className="text-xl font-semibold">Start a test</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Begin a new assessment
              </p>
              <button
                onClick={() => setShowDialog(true)}
                className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                Start
              </button>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <svg
                  className="w-6 h-6 text-green-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                  />
                </svg>
                <h2 className="text-xl font-semibold">Exams Simulation</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Review your Exams Simulation
              </p>
              <button
                onClick={() => setShowExamSimulationDialog(true)}
                className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                Start
              </button>
            </div>

            {/* <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <svg
                  className="w-6 h-6 text-purple-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <h2 className="text-xl font-semibold">Create tests</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Design your own assessments
              </p>
              <button
                onClick={() => {
                  toast.info("Coming soon");
                }}
                className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                Create
              </button>
            </div> */}

            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <svg
                  className="w-6 h-6 text-yellow-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 className="text-xl font-semibold">Test history</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                View past test results
              </p>
              <button
                onClick={() => {
                  router.push("/history");
                  // toast.info("need little fix");
                }}
                className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                History
              </button>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <svg
                  className="w-6 h-6 text-purple-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <h2 className="text-xl font-semibold">Learning Topics</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Explore various learning topics
              </p>
              <button
                onClick={() => setShowLearningTopicsDialog(true)}
                className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                Start
              </button>
            </div>
          </div>
        )}
      </div>

      {showExamSimulationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full relative">
            <button
              onClick={() => setShowExamSimulationDialog(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
              Choose a Category
            </h2>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              <button
                onClick={() => setSelectedCategory("previous_papers")}
                className={`w-full px-4 py-3 text-left text-lg rounded-md transition duration-200 ease-in-out flex justify-between items-center ${
                  selectedCategory === "previous_papers"
                    ? "bg-blue-100 dark:bg-blue-700 text-black dark:text-white font-semibold"
                    : "text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-800"
                }`}
              >
                <span>Previous Papers</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Coming Soon
                </span>
                {selectedCategory === "previous_papers" && (
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
              <button
                onClick={() => setSelectedCategory("exam_simulation")}
                className={`w-full px-4 py-3 text-left text-lg rounded-md transition duration-200 ease-in-out flex justify-between items-center ${
                  selectedCategory === "exam_simulation"
                    ? "bg-blue-100 dark:bg-blue-700 text-black dark:text-white font-semibold"
                    : "text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-800"
                }`}
              >
                <span>Exam Simulation</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  200 questions
                </span>
                {selectedCategory === "exam_simulation" && (
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
            </div>
            <button
              onClick={() => {
                if (selectedCategory === "exam_simulation") {
                  startTest(true); // Pass true to indicate it's an exam simulation
                } else {
                  toast.info("Previous Papers feature is coming soon!");
                }
              }}
              className={`mt-8 w-full px-4 py-3 rounded-md transition duration-200 ease-in-out ${
                selectedCategory && !isStartingTest
                  ? "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                  : "bg-blue-200 text-blue-400 dark:bg-blue-300 dark:text-blue-500 cursor-not-allowed"
              }`}
              disabled={!selectedCategory || isStartingTest}
            >
              {isStartingTest ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Starting Exam Simulation...
                </span>
              ) : (
                "Start"
              )}
            </button>
          </div>
        </div>
      )}

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full relative">
            <button
              onClick={() => {
                setShowDialog(false);
                setSelectedCategory(null);
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
              Choose a Category
            </h2>
            {isLoading ? (
              <p className="text-center">Loading categories...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 mb-4 text-lg rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                />
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full px-4 py-3 text-left text-lg rounded-md transition duration-200 ease-in-out flex justify-between items-center ${
                        selectedCategory === category.id
                          ? "bg-blue-100 dark:bg-blue-700 text-black dark:text-white font-semibold"
                          : "text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-800"
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {category.questionCount} questions
                      </span>
                      {selectedCategory === category.id && (
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
              </>
            )}
            <button
              onClick={() => {
                if (selectedCategory) {
                  setShowDialog(false);
                  setShowQuestionCountDialog(true);
                }
              }}
              className={`mt-8 w-full px-4 py-3 rounded-md transition duration-200 ease-in-out ${
                selectedCategory
                  ? "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                  : "bg-blue-200 text-blue-400 dark:bg-blue-300 dark:text-blue-500 cursor-not-allowed"
              }`}
              disabled={!selectedCategory}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showQuestionCountDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full relative">
            <button
              onClick={() => {
                setShowQuestionCountDialog(false);
                setSelectedCategory(null);
                setQuestionCount(null);
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
              How many questions?
            </h2>
            <div className="space-y-3">
              {/* Add the "Select All" button */}
              {selectedCategory && (
                <button
                  onClick={() => {
                    const category = categories.find(
                      (c) => c.id === selectedCategory
                    );
                    if (category) {
                      setQuestionCount(category.questionCount);
                    }
                  }}
                  className={`w-full px-4 py-3 text-left text-lg rounded-md transition duration-200 ease-in-out flex justify-between items-center ${
                    questionCount ===
                    categories.find((c) => c.id === selectedCategory)
                      ?.questionCount
                      ? "bg-blue-100 dark:bg-blue-700 text-black dark:text-white font-semibold"
                      : "text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-800"
                  }`}
                >
                  Select All (
                  {
                    categories.find((c) => c.id === selectedCategory)
                      ?.questionCount
                  }
                  )
                  {questionCount ===
                    categories.find((c) => c.id === selectedCategory)
                      ?.questionCount && (
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
              )}
              {questionOptions.map((count) => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`w-full px-4 py-3 text-left text-lg rounded-md transition duration-200 ease-in-out flex justify-between items-center ${
                    questionCount === count
                      ? "bg-blue-100 dark:bg-blue-700 text-black dark:text-white font-semibold"
                      : "text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-800"
                  }`}
                >
                  {count} questions
                  {questionCount === count && (
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
              <div className="relative">
                <input
                  type="number"
                  placeholder="Custom number"
                  min="1"
                  onChange={(e) =>
                    setQuestionCount(parseInt(e.target.value) || null)
                  }
                  className="w-full px-4 py-3 text-lg rounded-md border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                />
              </div>
            </div>
            <button
              onClick={() => {
                const selectedCategoryQuestions = categories.find(
                  (c) => c.id === selectedCategory
                )?.questionCount;

                if (selectedCategoryQuestions === undefined) {
                  toast.error("Selected category not found");
                } else if (
                  questionCount &&
                  questionCount > selectedCategoryQuestions
                ) {
                  toast.error(
                    "You can't select more questions than the category has"
                  );
                } else {
                  setShowQuestionCountDialog(false);
                  setShowTimerDialog(true);
                }
              }}
              className={`mt-8 w-full px-4 py-3 rounded-md transition duration-200 ease-in-out ${
                questionCount
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-blue-200 text-blue-400 cursor-not-allowed"
              }`}
              disabled={!questionCount}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showTimerDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full relative">
            <button
              onClick={() => {
                setShowTimerDialog(false);
                setIsTimedTest(false);
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
              Test Type
            </h2>
            <div className="space-y-4">
              <button
                onClick={() => setIsTimedTest(true)}
                className={`w-full px-4 py-3 text-left text-lg rounded-md transition duration-200 ease-in-out flex justify-between items-center ${
                  isTimedTest
                    ? "bg-blue-100 dark:bg-blue-700 text-black dark:text-white font-semibold"
                    : "text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-800"
                }`}
              >
                Timed Test
                {isTimedTest && (
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
              <button
                onClick={() => setIsTimedTest(false)}
                className={`w-full px-4 py-3 text-left text-lg rounded-md transition duration-200 ease-in-out flex justify-between items-center ${
                  isTimedTest === false
                    ? "bg-blue-100 dark:bg-blue-700 text-black dark:text-white font-semibold"
                    : "text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-800"
                }`}
              >
                No Timer
                {isTimedTest === false && (
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
            </div>
            <button
              onClick={() => {
                if (isTimedTest) {
                  setShowTimerDialog(false);
                  setShowTimeSettingDialog(true);
                } else {
                  startTest();
                }
              }}
              className={`mt-8 w-full px-4 py-3 rounded-md transition duration-200 ease-in-out ${
                isTimedTest !== null && !isStartingTest
                  ? "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                  : "bg-blue-200 text-blue-400 dark:bg-blue-300 dark:text-blue-500 cursor-not-allowed"
              }`}
              disabled={isTimedTest === null || isStartingTest}
            >
              {isStartingTest ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Starting Test...
                </span>
              ) : (
                "Next"
              )}
            </button>
          </div>
        </div>
      )}

      {showTimeSettingDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full relative">
            <button
              onClick={() => {
                setShowTimeSettingDialog(false);
                setIsTimedTest(false);
                setTestDuration(null);
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
              Set the Time
            </h2>
            <div className="flex space-x-2 mb-4">
              {timeOptions.map((hours) => (
                <button
                  key={hours}
                  onClick={() => setTestDuration(hours)}
                  className={`px-3 py-2 text-sm rounded-md transition duration-200 ease-in-out ${
                    testDuration === hours
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black dark:bg-gray-700 dark:text-white hover:bg-blue-100 dark:hover:bg-blue-800"
                  }`}
                >
                  {hours}h
                </button>
              ))}
            </div>
            <div className="flex space-x-2 mb-4">
              <div className="relative flex-grow">
                <input
                  type="number"
                  value={customTime || ""}
                  placeholder="Custom time"
                  min="0"
                  step="1"
                  onChange={(e) =>
                    setCustomTime(
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  className="w-full px-4 py-3 text-lg rounded-md border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                />
              </div>
              <select
                value={customTimeUnit}
                onChange={(e) =>
                  setCustomTimeUnit(
                    e.target.value as "hours" | "minutes" | "seconds"
                  )
                }
                className="px-3 py-2 rounded-md border border-blue-300 bg-white dark:bg-gray-700 text-black dark:text-white"
              >
                <option value="hours">hrs</option>
                <option value="minutes">mins</option>
                <option value="seconds">secs</option>
              </select>
            </div>
            <button
              onClick={() => startTest(false)}
              className={`mt-8 w-full px-4 py-3 rounded-md transition duration-200 ease-in-out ${
                testDuration && !isStartingTest
                  ? "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                  : "bg-blue-200 text-blue-400 dark:bg-blue-300 dark:text-blue-500 cursor-not-allowed"
              }`}
              disabled={!testDuration || isStartingTest}
            >
              {isStartingTest ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Starting Test...
                </span>
              ) : (
                "Start Test"
              )}
            </button>
          </div>
        </div>
      )}

      {showLearningTopicsDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full relative">
            <button
              onClick={() => setShowLearningTopicsDialog(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
              Learning Topics
            </h2>
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 mb-4 text-lg rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
            />
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {filteredTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`w-full px-4 py-3 text-left text-lg rounded-md transition duration-200 ease-in-out flex justify-between items-center ${
                    selectedTopic === topic.id
                      ? "bg-blue-100 dark:bg-blue-700 text-black dark:text-white font-semibold"
                      : "text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-800"
                  }`}
                >
                  <span>{topic.name} ({topic.document.totalPages} pages)</span>
                  {selectedTopic === topic.id && (
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
              className={`mt-8 w-full px-4 py-3 rounded-md transition duration-200 ease-in-out ${
                selectedTopic
                  ? "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                  : "bg-blue-200 text-blue-400 dark:bg-blue-300 dark:text-blue-500 cursor-not-allowed"
              }`}
              disabled={!selectedTopic}
            >
              Start Study
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
