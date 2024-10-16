"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { createTopic } from "@/src/lib/actions";
import { useState, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

type Topic = {
  id: string;
  name: string;
  question: any[];
  deleted?: boolean;
};

type CreateTopicResponse = {
  err: boolean;
  msg: string;
  data: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
  } | null;
};

type AddTopicFormProps = {
  setTopics: Dispatch<SetStateAction<Topic[]>>;
};

export default function AddTopicForm({ setTopics }: AddTopicFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = (await createTopic(formData)) as CreateTopicResponse;

    if (!result.err && result.data) {
      const newTopic: Topic = {
        id: result.data.id,
        name: result.data.name,
        question: [],
        deleted: result.data.deleted,
      };
      setTopics((prevTopics) => [...prevTopics, newTopic]);
      toast.success(result.msg || "Topic created successfully!");
      setIsDialogOpen(false);
      // Reset the form
      (e.target as HTMLFormElement).reset();
    } else {
      toast.warning(result.msg);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Topic
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Topic</DialogTitle>
          <DialogDescription>
            Enter a topic name to create a new topic.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="topicName">Topic Name</label>
            <Input
              id="topicName"
              name="topicName"
              placeholder="Enter topic name"
              required
            />
          </div>
          <Button type="submit">Submit</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
