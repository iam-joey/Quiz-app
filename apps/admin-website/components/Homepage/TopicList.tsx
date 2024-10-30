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
import { Input } from "@/components/ui/input";
import AddTopicForm from "./AddTopicForm";
import { deleteCategory, editCategoryName } from "@/src/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Edit } from "lucide-react";

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
  const [topicToEdit, setTopicToEdit] = useState<Topic | null>(null);
  const [newTopicName, setNewTopicName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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

  const handleEditConfirm = async () => {
    if (topicToEdit && newTopicName) {
      setIsEditing(true);
      const result = await editCategoryName(topicToEdit.id, newTopicName);
      setIsEditing(false);
      if (result.err) {
        toast.warning(`Failed to edit topic name: ${result.msg}`);
      } else {
        setTopics(
          topics.map((topic) =>
            topic.id === topicToEdit.id
              ? { ...topic, name: newTopicName }
              : topic
          )
        );
        toast.success("Topic name updated successfully");
        router.refresh();
        setIsEditDialogOpen(false); // Close the dialog on success
      }
      if (!result.err) {
        setTopicToEdit(null);
        setNewTopicName("");
      }
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
              <div className="flex space-x-2">
                <Dialog
                  open={isEditDialogOpen}
                  onOpenChange={setIsEditDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTopicToEdit(topic);
                        setNewTopicName(topic.name);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Topic Name</DialogTitle>
                      <DialogDescription>
                        Enter a new name for the topic.
                      </DialogDescription>
                    </DialogHeader>
                    <Input
                      value={newTopicName}
                      onChange={(e) => setNewTopicName(e.target.value)}
                      placeholder="New topic name"
                    />
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleEditConfirm} disabled={isEditing}>
                        {isEditing ? "Updating..." : "Update"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
                        This action cannot be undone. The topic will be marked
                        as deleted and renamed.
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
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
