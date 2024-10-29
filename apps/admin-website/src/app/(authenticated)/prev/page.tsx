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
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import { createTopic, getPrevTopics } from "@/src/lib/actions";
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
  const [dialogOpen, setDialogOpen] = useState(false);
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
      setDialogOpen(false);
      fetchPreviousYears();
      router.refresh();
      toast.success("Topic added successfully");
    } else {
      toast.error(result.msg || "Failed to add topic");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Previous Year Questions</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
              <CardFooter>
                <Button onClick={() => router.push(`/topics/${topic.id}`)}>
                  View Questions
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
