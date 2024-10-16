"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Flag {
  id: string;
  questionId: string;
  userId: string;
  description: string;
  resolved: boolean;
  comment?: string;
}

const ITEMS_PER_PAGE = 30;

function generateMockFlags(count: number): Flag[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${i + 1}`,
    questionId: `q${i + 1}`,
    userId: `user${i + 1}`,
    description: `This is a mock flag description for flag ${i + 1}`,
    resolved: Math.random() > 0.5,
    comment: Math.random() > 0.7 ? `Comment for flag ${i + 1}` : undefined,
  }));
}

export default function FlagManager() {
  const [flags, setFlags] = useState<Flag[]>(generateMockFlags(100));
  const [selectedFlag, setSelectedFlag] = useState<Flag | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  const handleResolveFlag = (id: string) => {
    setFlags((prevFlags) =>
      prevFlags.map((flag) =>
        flag.id === id ? { ...flag, resolved: true } : flag
      )
    );
    setSelectedFlag(null);
  };

  const handleAddComment = (id: string, comment: string) => {
    setFlags((prevFlags) =>
      prevFlags.map((flag) => (flag.id === id ? { ...flag, comment } : flag))
    );
    setSelectedFlag((prevFlag) => (prevFlag ? { ...prevFlag, comment } : null));
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
    onResolve,
    onAddComment,
  }: {
    flag: Flag;
    onClose: () => void;
    onResolve: (id: string) => void;
    onAddComment: (id: string, comment: string) => void;
  }) {
    const [comment, setComment] = useState(flag.comment || "");

    const handleResolve = () => {
      onResolve(flag.id);
    };

    const handleAddComment = () => {
      onAddComment(flag.id, comment);
    };

    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-auto p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Flag Details</CardTitle>
            <Button
              variant="ghost"
              className="absolute right-2 top-2"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Question ID:</strong> {flag.questionId}
            </div>
            <div>
              <strong>User ID:</strong> {flag.userId}
            </div>
            <div>
              <strong>Status:</strong>{" "}
              <span
                className={flag.resolved ? "text-green-600" : "text-red-600"}
              >
                {flag.resolved ? "Resolved" : "Unresolved"}
              </span>
            </div>
            <div>
              <strong>Description:</strong>
              <p className="bg-muted p-4 rounded mt-2">{flag.description}</p>
            </div>
            {!flag.resolved && (
              <Button onClick={handleResolve} className="w-full">
                Mark as Resolved
              </Button>
            )}
            <div>
              <strong>Admin Comment:</strong>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-2"
                rows={4}
              />
              <Button onClick={handleAddComment} className="mt-2 w-full">
                Add Comment
              </Button>
            </div>
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
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Flag Manager</h1>
      {selectedFlag ? (
        <FlagFullView
          flag={selectedFlag}
          onClose={handleCloseFullView}
          onResolve={handleResolveFlag}
          onAddComment={handleAddComment}
        />
      ) : (
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
      )}
    </div>
  );
}
