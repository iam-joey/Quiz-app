"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Flag = {
  id: string;
  description: string;
  questionId: string;
  userId: string;
  resolved: boolean;
  comment: string;
};

export default function PolishedFlagManager() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"resolved" | "unresolved">(
    "unresolved"
  );

  const fetchFlags = async (resolved: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/flags?resolved=${resolved}`);
      if (!response.ok) {
        throw new Error("Failed to fetch flags");
      }
      const data = await response.json();
      setFlags(data.flags);
      toast.success(`${resolved ? "Resolved" : "Unresolved"} flags loaded`);
    } catch (err) {
      console.error("Error fetching flags:", err);
      toast.error("Failed to fetch flags. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags(activeTab === "resolved");
  }, [activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as "resolved" | "unresolved");
  };

  const handleResolveFlag = async (flagId: string, comment: string) => {
    try {
      const response = await fetch(`/api/flags/${flagId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resolved: true, comment }),
      });
      if (!response.ok) {
        throw new Error("Failed to resolve flag");
      }
      toast.success("Flag marked as resolved");
      fetchFlags(false); // Refresh unresolved flags
    } catch (err) {
      console.error("Error resolving flag:", err);
      toast.error("Failed to resolve flag. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-7xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
          Flag Manager
        </CardTitle>
        <CardDescription className="text-lg">
          Efficiently manage and resolve flagged content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="unresolved" className="text-lg py-3">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Unresolved Flags
            </TabsTrigger>
            <TabsTrigger value="resolved" className="text-lg py-3">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Resolved Flags
            </TabsTrigger>
          </TabsList>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="unresolved">
                <FlagList
                  flags={flags}
                  loading={loading}
                  onResolve={handleResolveFlag}
                  isResolved={false}
                />
              </TabsContent>
              <TabsContent value="resolved">
                <FlagList flags={flags} loading={loading} isResolved={true} />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function FlagList({
  flags,
  loading,
  onResolve,
  isResolved,
}: {
  flags: Flag[];
  loading: boolean;
  onResolve?: (flagId: string, comment: string) => Promise<void>;
  isResolved: boolean;
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    );
  }

  if (flags.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <MessageCircle className="mx-auto h-12 w-12 mb-4" />
        <p className="text-xl font-semibold">No flags found</p>
        <p>
          All clear! There are no {isResolved ? "resolved" : "unresolved"} flags
          at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {flags.map((flag) => (
        <FlagCard
          key={flag.id}
          flag={flag}
          onResolve={onResolve}
          isResolved={isResolved}
        />
      ))}
    </div>
  );
}

function FlagCard({
  flag,
  onResolve,
  isResolved,
}: {
  flag: Flag;
  onResolve?: (flagId: string, comment: string) => Promise<void>;
  isResolved: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  const handleResolve = async () => {
    if (!onResolve) return;
    setIsResolving(true);
    await onResolve(flag.id, comment);
    setIsResolving(false);
    setIsOpen(false);
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 10 }}
      >
        <Card
          className="h-full cursor-pointer bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-300"
          onClick={() => setIsOpen(true)}
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {flag.description}
            </CardTitle>
            <CardDescription className="text-sm">
              Question ID: {flag.questionId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>User ID: {flag.userId}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isResolved
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {isResolved ? "Resolved" : "Unresolved"}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Flag Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Description</h3>
              <p>{flag.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-1">Question ID</h3>
                <p className="text-sm">{flag.questionId}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">User ID</h3>
                <p className="text-sm">{flag.userId}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Status</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isResolved
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {isResolved ? "Resolved" : "Unresolved"}
              </span>
            </div>
            {flag.comment && (
              <div>
                <h3 className="font-semibold mb-1">Comment</h3>
                <p className="text-sm">{flag.comment}</p>
              </div>
            )}
            {!isResolved && (
              <div className="space-y-4">
                <Textarea
                  placeholder="Add a comment before resolving..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button
                  onClick={handleResolve}
                  disabled={!comment.trim() || isResolving}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {isResolving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Mark as Resolved
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
