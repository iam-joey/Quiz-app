"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Plus, Edit, Trash } from "lucide-react";
import {
  createTopic,
  getPrevTopics,
  deleteCategory,
  editCategoryName,
} from "@/src/lib/actions";
import { toast } from "sonner";

interface Topic {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  prevTopic: boolean;
  deleted: boolean;
}

export default function PreviousYears() {
  const [previousYears, setPreviousYears] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTopic, setNewTopic] = useState("");
  const [addingTopic, setAddingTopic] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editedName, setEditedName] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchPreviousYears();
  }, []);

  const fetchPreviousYears = async () => {
    setLoading(true);
    const result = await getPrevTopics();
    if (!result.err && result.data) {
      setPreviousYears(result.data);
    } else {
      toast.error(result.msg || "Failed to fetch previous years");
    }
    setLoading(false);
  };

  const handleAddTopic = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTopic.trim()) return;

    setAddingTopic(true);
    const formData = new FormData();
    formData.append("topicName", newTopic.trim());
    const result = await createTopic(formData, true);
    setAddingTopic(false);

    if (!result.err) {
      setNewTopic("");
      setAddDialogOpen(false);
      fetchPreviousYears();
      router.refresh();
      toast.success("Topic added successfully");
    } else {
      toast.error(result.msg || "Failed to add topic");
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (confirm("Are you sure you want to delete this topic?")) {
      const result = await deleteCategory(id);
      if (!result.err) {
        fetchPreviousYears();
        router.refresh();
        toast.success("Topic deleted successfully");
      } else {
        toast.error(result.msg || "Failed to delete topic");
      }
    }
  };

  const handleEditTopic = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingTopic || !editedName.trim()) return;

    const result = await editCategoryName(editingTopic.id, editedName.trim());
    if (!result.err) {
      setEditDialogOpen(false);
      fetchPreviousYears();
      router.refresh();
      toast.success("Topic name updated successfully");
    } else {
      toast.error(result.msg || "Failed to update topic name");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Previous Year Questions</h1>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Topic
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Topic</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleAddTopic}
              className="flex items-center space-x-2"
            >
              <Input
                placeholder="Enter topic name"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
              />
              <Button type="submit" disabled={addingTopic}>
                {addingTopic ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {previousYears.map((topic) => (
            <Card key={topic.id}>
              <CardHeader>
                <CardTitle>{topic.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(topic.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Updated: {new Date(topic.updatedAt).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button onClick={() => router.push(`/topics/${topic.id}`)}>
                  View Questions
                </Button>
                <div className="space-x-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setEditingTopic(topic);
                      setEditedName(topic.name);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleDeleteTopic(topic.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Topic Name</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditTopic}>
            <Input
              placeholder="Enter new topic name"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
            />
            <DialogFooter className="mt-4">
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
