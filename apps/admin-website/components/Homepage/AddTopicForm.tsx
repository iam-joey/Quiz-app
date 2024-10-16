"use client";

import { useState, useTransition, Dispatch, SetStateAction } from "react";
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
import { PlusCircle, Loader2 } from "lucide-react";
import { createTopic } from "@/src/lib/actions";
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
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
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
        (e.target as HTMLFormElement).reset();
      } else {
        toast.warning(result.msg);
      }
    });
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
            <label
              htmlFor="topicName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Topic Name
            </label>
            <Input
              id="topicName"
              name="topicName"
              placeholder="Enter topic name"
              required
              disabled={isPending}
            />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
