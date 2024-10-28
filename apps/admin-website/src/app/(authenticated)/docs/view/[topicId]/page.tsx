"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Maximize2, Minimize2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
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
  const router = useRouter();

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
    const object = document.querySelector("object") as HTMLObjectElement;
    if (iframe && pdfUrl) {
      iframe.src = `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;
    }
    if (object && pdfUrl) {
      object.data = `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;
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
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto my-8">
      <Button
        className="self-start mb-4"
        variant="outline"
        onClick={() => router.push("/docs")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Card className="w-full h-screen">
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
                sandbox="allow-scripts allow-forms allow-popups allow-top-navigation"
              />
              <object
                data={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                type="application/pdf"
                className="w-full h-full absolute top-0 left-0"
              >
                <p>
                  Your browser doesn't support PDF viewing. Please{" "}
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                    download the PDF
                  </a>{" "}
                  to view it.
                </p>
              </object>
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
      </Card>
    </div>
  );
}
