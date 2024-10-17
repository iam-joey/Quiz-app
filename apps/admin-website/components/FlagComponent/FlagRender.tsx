"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface Flag {
  id: string;
  questionId: string;
  userId: string;
  description: string;
  resolved: boolean;
  comment?: string;
}

const ITEMS_PER_PAGE = 30;

export default function FlagManager() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<Flag | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"unresolved" | "resolved">(
    "unresolved"
  );

  const fetchFlags = async (resolved: boolean) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/flags?resolved=${resolved}`);
      const data = await response.json();

      if (!data.error && data.flags) {
        setFlags(data.flags);
      } else {
        toast.error(data.msg || "Failed to fetch flags");
      }
    } catch (error) {
      toast.error("Error fetching flags");
      console.error("Error fetching flags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags(activeTab === "resolved");
  }, [activeTab]);

  const totalPages = Math.ceil(flags.length / ITEMS_PER_PAGE);
  const paginatedFlags = flags.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFlagClick = (flag: Flag) => {
    setSelectedFlag(flag);
  };

  const handleCloseFullView = () => {
    setSelectedFlag(null);
  };

  const handleUpdateFlag = async (
    id: string,
    resolved: boolean,
    comment: string
  ) => {
    try {
      const response = await fetch(`/api/flags/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resolved, comment }),
      });
      const data = await response.json();

      if (!data.error) {
        setFlags((prevFlags) => prevFlags.filter((flag) => flag.id !== id));
        setSelectedFlag(null);
        toast.success("Flag updated successfully");
      } else {
        toast.error(data.msg || "Failed to update flag");
      }
    } catch (error) {
      toast.error("Error updating flag");
      console.error("Error updating flag:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  function FlagItem({ flag, onClick }: { flag: Flag; onClick: () => void }) {
    return (
      <Card
        className="mb-4 cursor-pointer hover:bg-accent transition-colors"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <h3 className="font-bold">{flag.questionId}</h3>
          <div className="text-sm text-muted-foreground truncate">
            {flag.description}
          </div>
          <div className="flex items-center mt-2">
            {flag.resolved ? (
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
            )}
            <span
              className={`text-xs ${flag.resolved ? "text-green-600" : "text-red-600"}`}
            >
              {flag.resolved ? "Resolved" : "Unresolved"}
            </span>
          </div>
          {flag.comment && (
            <p className="text-xs text-muted-foreground mt-2">
              Comment: {flag.comment}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  function FlagFullView({
    flag,
    onClose,
    onUpdate,
  }: {
    flag: Flag;
    onClose: () => void;
    onUpdate: (id: string, resolved: boolean, comment: string) => void;
  }) {
    const [resolved, setResolved] = useState(flag.resolved);
    const [comment, setComment] = useState(flag.comment || "");

    const handleSubmit = () => {
      onUpdate(flag.id, resolved, comment);
    };

    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-auto p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardContent className="space-y-4 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Flag Details</h2>
              <Button variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <div>
              <strong>Question ID:</strong> {flag.questionId}
            </div>
            <div>
              <strong>User ID:</strong> {flag.userId}
            </div>
            <div className="flex items-center space-x-2">
              <strong>Status:</strong>
              <Switch
                checked={resolved}
                onCheckedChange={setResolved}
                aria-label="Toggle resolved status"
              />
              <span className={resolved ? "text-green-600" : "text-red-600"}>
                {resolved ? "Resolved" : "Unresolved"}
              </span>
            </div>
            <div>
              <strong>Description:</strong>
              <p className="bg-muted p-4 rounded mt-2">{flag.description}</p>
            </div>
            <div>
              <strong>Admin Comment:</strong>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
            <Button onClick={handleSubmit} className="w-full">
              Submit
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  function Pagination({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
        {pageNumbers.map((number, index) => (
          <Button
            key={index}
            variant={number === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => typeof number === "number" && onPageChange(number)}
            disabled={typeof number !== "number"}
          >
            {number}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Flag Manager</h1>
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "unresolved" | "resolved")
        }
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="unresolved">Unresolved</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>
        <TabsContent value="unresolved">{renderFlagList()}</TabsContent>
        <TabsContent value="resolved">{renderFlagList()}</TabsContent>
      </Tabs>
    </div>
  );

  function renderFlagList() {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (selectedFlag) {
      return (
        <FlagFullView
          flag={selectedFlag}
          onClose={handleCloseFullView}
          onUpdate={handleUpdateFlag}
        />
      );
    }

    if (flags.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No flags found
        </div>
      );
    }

    return (
      <>
        <div className="grid gap-4">
          {paginatedFlags.map((flag) => (
            <FlagItem
              key={flag.id}
              flag={flag}
              onClick={() => handleFlagClick(flag)}
            />
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </>
    );
  }
}
