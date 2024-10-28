"use client";

import { authOptions } from "@/src/lib/auth";
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { PDFDocumentProxy, getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.entry";
import { useTheme } from "next-themes";
import { useLearningTopic } from '@/components/context/LearningTopicContext';

// Set the workerSrc to the local worker
GlobalWorkerOptions.workerSrc = pdfWorker;

export default function LearningTopic() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const progressId = useParams().topicId;
  //@ts-ignore
  const session = useSession(authOptions);
  const { theme } = useTheme();
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { learningTopicData, setLearningTopicData } = useLearningTopic();
  const [isLoading, setIsLoading] = useState(true);
  const [currentTopicIndex, setCurrentTopicIndex] = useState<number>(0);
  const [topicsProgress, setTopicsProgress] = useState<Record<string, number>>({});

  // Initialize topicsProgress when topics are loaded
  useEffect(() => {
    if (topics.length > 0) {
      const initialProgress = topics.reduce((acc, topic) => ({
        ...acc,
        [topic.id]: topic.progress.currentPage || 1
      }), {});
      setTopicsProgress(initialProgress);
    }
  }, [topics]);

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!topics.length) return 0;
    
    const totalPages = topics.reduce((sum, topic) => sum + topic.progress.totalPages, 0);
    const completedPages = topics.reduce((sum, topic) => {
      const currentProgress = topicsProgress[topic.id] || topic.progress.currentPage || 1;
      return sum + currentProgress;
    }, 0);
    
    return Math.round((completedPages / totalPages) * 100);
  };

  // Update progress whenever relevant states change
  useEffect(() => {
    if (topics.length > 0) {
      const overallProgress = calculateOverallProgress();
      setProgress(overallProgress);
    }
  }, [topics, topicsProgress]);

  useEffect(() => {
    if (session.data?.user) {
      if (learningTopicData) {
        // Process the data from context
        const topicsArray = learningTopicData.userTopics.map((userTopic: any) => {
          const pdfData = learningTopicData.pdfs.find(
            (pdf: any) => pdf.topicId === userTopic.topic.id
          );
          return {
            id: userTopic.topic.id,
            title: userTopic.topic.name,
            pdfUrl: pdfData?.pdf
              ? `data:application/pdf;base64,${pdfData.pdf}`
              : null,
            progress: {
              currentPage: userTopic.currentPage || 1,
              totalPages: userTopic.topic.pages || 0,
            },
          };
        });

        setTopics(topicsArray);
        setIsLoading(false);
      } else {
        // If no context data, fetch from API
        fetchTopics();
      }
    }
  }, [session.data?.user, learningTopicData]);

  useEffect(() => {
    if (topics.length > 0 && !selectedTopic) {
      // Find the topic that matches the progressId from the URL
      const initialTopic = topics.find(topic => topic.id === progressId) || topics[0];
      const topicIndex = topics.findIndex(topic => topic.id === initialTopic.id);
      
      setSelectedTopic(initialTopic);
      setPdfUrl(initialTopic.pdfUrl);
      // Make sure to use the saved current page
      const savedPage = initialTopic.progress.currentPage || 1;
      setPageNumber(savedPage);
      setCurrentTopicIndex(topicIndex);
    }
  }, [topics, selectedTopic, progressId]);

  useEffect(() => {
    if (selectedTopic && selectedTopic.pdfUrl) {
      renderPDF(selectedTopic.pdfUrl, pageNumber);
    }
  }, [selectedTopic, pageNumber]);

  useEffect(() => {
    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "c" ||
          e.key === "C" ||
          e.key === "p" ||
          e.key === "P" ||
          e.key === "s" ||
          e.key === "S")
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", preventKeyboardShortcuts);
    return () => {
      window.removeEventListener("keydown", preventKeyboardShortcuts);
    };
  }, []);

  const fetchTopics = async () => {
    const userId = (session.data?.user as any)?.id;
    try {
      const response = await fetch(`/api/learningtopic/${userId}/${progressId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch topics');
      }
      const data = await response.json();
      
      setLearningTopicData(data.data);

      const topicsArray = data.data.userTopics.map((userTopic: any) => {
        const pdfData = data.data.pdfs.find(
          (pdf: any) => pdf.topicId === userTopic.topic.id
        );
        return {
          id: userTopic.topic.id,
          title: userTopic.topic.name,
          pdfUrl: pdfData?.pdf
            ? `data:application/pdf;base64,${pdfData.pdf}`
            : null,
          progress: {
            currentPage: parseInt(userTopic.currentPage) || 1,
            totalPages: parseInt(userTopic.topic.pages) || 0,
          },
        };
      });

      setTopics(topicsArray);
    } catch (error) {
      console.error("Error fetching topics:", error);
      setTopics([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPDF = (url: string, pageNum: number) => {
    if (!canvasRef.current) return;

    getDocument(url)
      .promise.then((pdfDoc: PDFDocumentProxy) => {
        setNumPages(pdfDoc.numPages);
        if (pageNum > pdfDoc.numPages) {
          setPageNumber(pdfDoc.numPages);
          return;
        }
        pdfDoc
          .getPage(pageNum)
          .then((page) => {
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Add protection attributes to canvas
            canvas.style.userSelect = "none";
            canvas.style.webkitUserSelect = "none";
            canvas.style.userSelect = "none";
            canvas.style.pointerEvents = "none";

            // Clear and prepare container
            canvasRef.current!.innerHTML = "";
            const container = document.createElement("div");

            // Style container for protection
            container.style.position = "relative";
            container.style.userSelect = "none";
            container.style.webkitUserSelect = "none";
            container.style.userSelect = "none";

            // Add protective overlay
            const overlay = document.createElement("div");
            overlay.style.position = "absolute";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.width = "100%";
            overlay.style.height = "100%";
            overlay.style.backgroundColor = "transparent";
            overlay.style.cursor = "default";

            // Prevent various events
            overlay.addEventListener("contextmenu", (e) => e.preventDefault());
            overlay.addEventListener("dragstart", (e) => e.preventDefault());
            overlay.addEventListener("selectstart", (e) => e.preventDefault());
            overlay.addEventListener("copy", (e) => e.preventDefault());
            overlay.addEventListener("cut", (e) => e.preventDefault());
            overlay.addEventListener("paste", (e) => e.preventDefault());

            // Append elements
            container.appendChild(canvas);
            container.appendChild(overlay);
            canvasRef.current!.appendChild(container);

            const renderContext = {
              canvasContext: ctx,
              viewport: viewport,
            };
            page.render(renderContext);
          })
          .catch((error) => {
            console.error("Error rendering PDF page:", error);
          });
      })
      .catch((error) => {
        console.error("Error loading PDF document:", error);
      });
  };

  const updateCurrentPage = async (newPage: number) => {
    if (!session.data?.user || !selectedTopic) return;
    const userId = (session.data.user as any).id;

    try {
      const response = await fetch(
        `/api/updatecurrentpage/${userId}/${progressId}/${selectedTopic.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ page: newPage }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update current page");
      }

      // Update topicsProgress
      setTopicsProgress(prev => ({
        ...prev,
        [selectedTopic.id]: newPage
      }));

      // Update topics array
      setTopics(prevTopics =>
        prevTopics.map(topic =>
          topic.id === selectedTopic.id
            ? {
                ...topic,
                progress: { ...topic.progress, currentPage: newPage }
              }
            : topic
        )
      );

      // Update selected topic
      setSelectedTopic((prev:any) => ({
        ...prev,
        progress: { ...prev.progress, currentPage: newPage }
      }));

      // Update learning topic context
      if (setLearningTopicData && learningTopicData) {
        setLearningTopicData({
          ...learningTopicData,
          userTopics: learningTopicData.userTopics.map((userTopic: any) =>
            userTopic.topic.id === selectedTopic.id
              ? { ...userTopic, currentPage: newPage }
              : userTopic
          ),
        });
      }

    } catch (error) {
      console.error("Error updating current page:", error);
    }
  };

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      const newPage = pageNumber - 1;
      setPageNumber(newPage);
      updateCurrentPage(newPage);
    } else if (currentTopicIndex > 0) {
      // Go to previous topic's last page
      const prevTopic = topics[currentTopicIndex - 1];
      setCurrentTopicIndex(currentTopicIndex - 1);
      handleTopicClick(prevTopic);
      setPageNumber(prevTopic.progress.totalPages);
      updateCurrentPage(prevTopic.progress.totalPages);
    }
  };

  const goToNextPage = () => {
    if (pageNumber < numPages) {
      const newPage = pageNumber + 1;
      setPageNumber(newPage);
      updateCurrentPage(newPage);
    } else if (currentTopicIndex < topics.length - 1) {
      // Go to next topic's first page
      const nextTopic = topics[currentTopicIndex + 1];
      setCurrentTopicIndex(currentTopicIndex + 1);
      handleTopicClick(nextTopic);
      setPageNumber(1);
      updateCurrentPage(1);
    }
  };

  const goToFirstPage = () => {
    setPageNumber(1);
    updateCurrentPage(1);
  };

  const handleTopicClick = (topic: any) => {
    setSelectedTopic(topic);
    setPdfUrl(topic.pdfUrl);
    const currentPage = topicsProgress[topic.id] || topic.progress.currentPage || 1;
    setPageNumber(currentPage);
    setNumPages(topic.progress.totalPages || 0);
    const index = topics.findIndex((t) => t.id === topic.id);
    setCurrentTopicIndex(index);
  };

  useEffect(() => {
    if (selectedTopic && selectedTopic.progress.currentPage) {
      setPageNumber(selectedTopic.progress.currentPage);
    }
  }, [selectedTopic]);

  return (
    <div
      className="container mx-auto p-4 flex"
      onContextMenu={(e) => e.preventDefault()}
    >
      {isLoading ? (
        <div className="w-full text-center">Loading...</div>
      ) : (
        <>
          <div className="w-3/4 pr-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-center dark:text-white">
                Learning Topic
              </h1>
              <button
                className="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded"
                onClick={goToFirstPage}
              >
                Back to Start
              </button>
            </div>
            
            {selectedTopic && (
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
                Topic: {selectedTopic.title}
              </p>
            )}

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium dark:text-white">Overall Progress</span>
                <span className="text-sm font-medium dark:text-white">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {topics.reduce((sum, topic) => sum + (topicsProgress[topic.id] || topic.progress.currentPage || 1), 0)} of {' '}
                {topics.reduce((sum, topic) => sum + topic.progress.totalPages, 0)} pages completed
              </div>
            </div>

            {pdfUrl ? (
              <div
                className="flex flex-col items-center"
                onContextMenu={(e) => e.preventDefault()}
              >
                <div
                  ref={canvasRef}
                  className="flex justify-center select-none"
                  style={{
                    WebkitTouchCallout: "none",
                    WebkitUserSelect: "none",
                    KhtmlUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                    userSelect: "none",
                  }}
                ></div>
                <div className="flex justify-between mt-4 w-full max-w-md">
                  <button
                    className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded disabled:bg-gray-300 dark:disabled:bg-gray-600"
                    disabled={pageNumber <= 1 && currentTopicIndex === 0}
                    onClick={goToPrevPage}
                  >
                    Previous
                  </button>
                  <span className="self-center dark:text-white">
                    Page {pageNumber} of {numPages}
                  </span>
                  <button
                    className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded disabled:bg-gray-300 dark:disabled:bg-gray-600"
                    disabled={pageNumber >= numPages && currentTopicIndex === topics.length - 1}
                    onClick={goToNextPage}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center dark:text-white">
                No PDF available for this topic.
              </div>
            )}
          </div>

          <div className="w-1/4 pl-4 border-l border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Topics</h2>
            {Array.isArray(topics) && topics.length > 0 ? (
              <ul>
                {topics.map((topic, index) => (
                  <li
                    key={topic.id}
                    className={`cursor-pointer p-2 mb-2 rounded transition-colors duration-200
                      ${
                        selectedTopic?.id === topic.id
                          ? "bg-blue-100 dark:bg-blue-900"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    onClick={() => handleTopicClick(topic)}
                  >
                    <div className="dark:text-white">{topic.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Page {topic.progress.currentPage} of {topic.progress.totalPages}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {index < currentTopicIndex ? (
                        <span className="text-green-500">Completed</span>
                      ) : index === currentTopicIndex ? (
                        <span className="text-blue-500">In Progress</span>
                      ) : (
                        <span>Not Started</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dark:text-white">No topics available.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
