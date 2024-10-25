"use client";

import { authOptions } from "@/src/lib/auth";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { PDFDocumentProxy, getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorker from 'pdfjs-dist/build/pdf.worker.entry';

// Set the workerSrc to the local worker
GlobalWorkerOptions.workerSrc = pdfWorker;

export default function LearningTopic() {
  const { topicId } = useParams();
  //@ts-ignore
  const session = useSession(authOptions);
  const [topic, setTopic] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!topicId) return;
    fetchTopic();
  }, []);

  useEffect(() => {
    if (pdfUrl) {
      renderPDF(pdfUrl, pageNumber);
    }
  }, [pdfUrl, pageNumber]);

  useEffect(() => {
    if (numPages > 0) {
      setProgress((pageNumber / numPages) * 100);
    }
  }, [pageNumber, numPages]);

  const fetchTopic = async () => {
    const userId = (session.data?.user as any)?.id;
    try {
      const response = await fetch(`/api/userlearning/${userId}/${topicId}`);
      if (!response.ok) {
        console.error("Failed to fetch PDF data:", response.statusText);
        return;
      }
      const data = await response.json();
      console.log("Fetched data:", data);
      setTopic(data);

      if (data.pdf) {
        try {
          const byteCharacters = atob(data.pdf);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);

          // Set the initial page number from the progress data
          if (data.progress && data.progress.currentPage) {
            setPageNumber(data.progress.currentPage);
          }

          // Set the total number of pages
          if (data.progress && data.progress.totalPages) {
            setNumPages(data.progress.totalPages);
          }
        } catch (error) {
          console.error("Error creating Blob URL:", error);
        }
      } else {
        console.warn("No PDF data found in response.");
      }
    } catch (error) {
      console.error("Error fetching topic data:", error);
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
    if (!session.data?.user) return;
    const userId = (session.data.user as any).id;

    try {
      const response = await fetch(`/api/updatecurrentpage/${userId}/${topicId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPage: newPage }),
      });

      if (!response.ok) {
        throw new Error('Failed to update current page');
      }

      const data = await response.json();
      console.log('Page update response:', data);
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Learning Topic</h1>
      <p className="text-gray-600 mb-4 text-center">Topic ID: {topicId}</p>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-center mb-4">Progress: {Math.round(progress)}%</p>

      {pdfUrl ? (
        <div className="flex flex-col items-center">
          <div ref={canvasRef} className="flex justify-center"></div>
          <div className="flex justify-between mt-4 w-full max-w-md">
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              disabled={pageNumber <= 1} 
              onClick={goToPrevPage}
            >
              Previous
            </button>
            <span className="self-center">Page {pageNumber} of {numPages}</span>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              disabled={pageNumber >= numPages}
              onClick={goToNextPage}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">Loading PDF...</div>
      )}
      {/* Add more details about the topic as needed */}
    </div>
  );
}
