"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Maximize2, Minimize2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";

export default function PDFViewer({
  params,
}: {
  params: {
    topicId: string;
  };
}) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const topicId = params.topicId as string;

  useEffect(() => {
    const fetchPDF = async () => {
      try {
        const response = await fetch(`/api/document/${topicId}`, {
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch PDF");
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        setError("Failed to load the PDF");
        toast.error("Failed to load the PDF");
      } finally {
        setLoading(false);
      }
    };

    fetchPDF();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [topicId]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && pdfUrl) {
      iframe.src = `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;
    }
  }, [pdfUrl]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      pdfContainerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  return (
    <Card className="w-full h-screen max-w-4xl mx-auto my-8">
      <CardContent className="p-0 h-full relative" ref={pdfContainerRef}>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full text-red-500">
            {error}
          </div>
        ) : pdfUrl ? (
          <>
            <iframe
              ref={iframeRef}
              className="w-full h-full border-none"
              title="PDF Viewer"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
            />
            <Button
              className="absolute top-2 right-2 z-10"
              variant="outline"
              size="icon"
              onClick={toggleFullScreen}
            >
              {isFullScreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isFullScreen ? "Exit full screen" : "Enter full screen"}
              </span>
            </Button>
          </>
        ) : (
          <div className="flex justify-center items-center h-full">
            No PDF available
          </div>
        )}
      </CardContent>
      <Toaster position="bottom-right" />
    </Card>
  );
}
