"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddTopicForm from "./AddTopicForm";
import { deleteCategory } from "@/src/lib/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Topic = {
  id: string;
  name: string;
  question: any[];
  deleted?: boolean;
};

export default function TopicList({
  initialTopics,
}: {
  initialTopics: Topic[];
}) {
  const [topics, setTopics] = useState(initialTopics);
  const [topicToDelete, setTopicToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState<{
    [key: string]: boolean;
  }>({});
  const router = useRouter();

  const handleDeleteConfirm = async () => {
    if (topicToDelete) {
      setIsDeleting(true);
      const result = await deleteCategory(topicToDelete);
      setIsDeleting(false);
      if (result.err) {
        toast.warning(`Failed to delete topic: ${result.msg}`);
      } else {
        setTopics(
          topics.map((topic) =>
            topic.id === topicToDelete
              ? { ...topic, deleted: true, name: `deleted_${topic.name}` }
              : topic
          )
        );
        toast.success("Topic deleted successfully");
        router.refresh();
      }
      setTopicToDelete(null);
    }
  };

  const handleViewQuestions = (topicId: string) => {
    setLoadingTopics((prev) => ({ ...prev, [topicId]: true }));
    // Simulate navigation delay
    setTimeout(() => {
      router.push(`/topics/${topicId}`);
    }, 500);
  };

  const activeTopics = topics.filter((topic) => !topic.deleted);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Topic List</h1>
        <AddTopicForm setTopics={setTopics} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activeTopics.map((topic: Topic) => (
          <Card key={topic.id}>
            <CardHeader>
              <CardTitle>{topic.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Questions: {topic.question.length}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => handleViewQuestions(topic.id)}
                disabled={loadingTopics[topic.id]}
              >
                {loadingTopics[topic.id] ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "View Questions"
                )}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    onClick={() => setTopicToDelete(topic.id)}
                  >
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Are you sure you want to delete this topic?
                    </DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. The topic will be marked as
                      deleted and renamed.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setTopicToDelete(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteConfirm}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
