"use client";

import { authOptions } from "@/src/lib/auth";
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { PDFDocumentProxy, getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { useTheme } from 'next-themes';

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

  useEffect(() => {
    if (session.data?.user) {
      fetchTopics();
    }
  }, [session.data?.user]);

  useEffect(() => {
    if (selectedTopic && selectedTopic.pdfUrl) {
      renderPDF(selectedTopic.pdfUrl, pageNumber);
    }
  }, [selectedTopic, pageNumber]);

  useEffect(() => {
    if (numPages > 0) {
      setProgress((pageNumber / numPages) * 100);
    }
  }, [pageNumber, numPages]);

  const fetchTopics = async () => {
    const userId = (session.data?.user as any)?.id;
    try {
      const response = await fetch(`/api/learningtopic/${userId}/${progressId}`);
      if (!response.ok) {
        console.error("Failed to fetch topics:", response.statusText);
        return;
      }
      const data = await response.json();
      console.log("data", data);
      
      const topicsArray = data.data.userTopics.map((userTopic: any) => {
        const pdfData = data.data.pdfs.find((pdf: any) => pdf.topicId === userTopic.topic.id);
        return {
          id: userTopic.topic.id,
          title: userTopic.topic.name,
          pdfUrl: pdfData?.pdf ? `data:application/pdf;base64,${pdfData.pdf}` : null,
          progress: {
            currentPage: userTopic.currentPage || 1,
            totalPages: 0, // We'll set this when rendering the PDF
          },
        };
      });
      
      setTopics(topicsArray);
      
      // Set the first topic as default or the one matching topicId
      const defaultTopic = progressId 
        ? topicsArray.find((t: any) => t.id === progressId) 
        : topicsArray[0];
      
      if (defaultTopic) {
        setSelectedTopic(defaultTopic);
        setPdfUrl(defaultTopic.pdfUrl);
        setPageNumber(defaultTopic.progress.currentPage);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
      setTopics([]); // Set to empty array in case of error
    }
  };

  const renderPDF = (url: string, pageNum: number) => {
    if (!canvasRef.current) return;

    getDocument(url).promise.then((pdfDoc: PDFDocumentProxy) => {
      setNumPages(pdfDoc.numPages);
      if (pageNum > pdfDoc.numPages) {
        setPageNumber(pdfDoc.numPages);
        return;
      }
      pdfDoc.getPage(pageNum).then((page) => {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvasRef.current!.innerHTML = ""; // Clear previous canvas
        canvasRef.current!.appendChild(canvas);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };
        page.render(renderContext);
      }).catch(error => {
        console.error("Error rendering PDF page:", error);
      });
    }).catch(error => {
      console.error("Error loading PDF document:", error);
    });
  };

  const updateCurrentPage = async (newPage: number) => {
    if (!session.data?.user || !selectedTopic) return;
    const userId = (session.data.user as any).id;
    console.log("userId", userId);
    console.log("progressId", progressId);
    console.log("selectedTopic.id", selectedTopic.id);

    try {
      const response = await fetch(`/api/updatecurrentpage/${userId}/${progressId}/${selectedTopic.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page: newPage }),
      });

      if (!response.ok) {
        throw new Error('Failed to update current page');
      }

      const data = await response.json();
      console.log('Page update response:', data);

      // Update the local state
      setTopics(prevTopics => prevTopics.map(topic => 
        topic.id === selectedTopic.id 
          ? { ...topic, progress: { ...topic.progress, currentPage: newPage } }
          : topic
      ));
    } catch (error) {
      console.error('Error updating current page:', error);
    }
  };

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      const newPage = pageNumber - 1;
      setPageNumber(newPage);
      updateCurrentPage(newPage);
    }
  };

  const goToNextPage = () => {
    if (pageNumber < numPages) {
      const newPage = pageNumber + 1;
      setPageNumber(newPage);
      updateCurrentPage(newPage);
    }
  };

  const handleTopicClick = (topic: any) => {
    setSelectedTopic(topic);
    setPdfUrl(topic.pdfUrl);
    setPageNumber(topic.progress.currentPage);
    setNumPages(topic.progress.totalPages || 0);
    // router.push(`/learningTopic/${topic.id}`);
  };

  return (
    <div className="container mx-auto p-4 flex">
      {/* PDF Viewer */}
      <div className="w-3/4 pr-4">
        <h1 className="text-2xl font-bold mb-4 text-center dark:text-white">Learning Topic</h1>
        {selectedTopic && <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">Topic: {selectedTopic.title}</p>}
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
          <div 
            className="bg-blue-600 dark:bg-blue-400 h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-center mb-4 dark:text-white">Progress: {Math.round(progress)}%</p>

        {pdfUrl ? (
          <div className="flex flex-col items-center">
            <div ref={canvasRef} className="flex justify-center"></div>
            <div className="flex justify-between mt-4 w-full max-w-md">
              <button 
                className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded disabled:bg-gray-300 dark:disabled:bg-gray-600"
                disabled={pageNumber <= 1} 
                onClick={goToPrevPage}
              >
                Previous
              </button>
              <span className="self-center dark:text-white">Page {pageNumber} of {numPages}</span>
              <button 
                className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded disabled:bg-gray-300 dark:disabled:bg-gray-600"
                disabled={pageNumber >= numPages}
                onClick={goToNextPage}
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center dark:text-white">No PDF available for this topic.</div>
        )}
      </div>
      
      {/* Topics sidebar */}
      <div className="w-1/4 pl-4 border-l border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Topics</h2>
        {Array.isArray(topics) && topics.length > 0 ? (
          <ul>
            {topics.map((topic) => (
              <li 
                key={topic.id} 
                className={`cursor-pointer p-2 mb-2 rounded transition-colors duration-200
                  ${selectedTopic?.id === topic.id 
                    ? 'bg-blue-100 dark:bg-blue-900' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => handleTopicClick(topic)}
              >
                <div className="dark:text-white">{topic.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Page {topic.progress.currentPage} / {topic.progress.totalPages || '?'}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="dark:text-white">No topics available.</p>
        )}
      </div>
    </div>
  );
}
