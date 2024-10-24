"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon, CalendarIcon, ClockIcon, SearchIcon } from "lucide-react";
import { addTopicDoc, getTopicDocs } from "@/src/lib/actions";
import { toast, Toaster } from "sonner";

function formatDate(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

type Topic = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function TopicManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchTopics() {
      const result = await getTopicDocs();
      if (!result.err && result.data) {
        setTopics(result.data);
      } else {
        toast.error(result.msg);
      }
    }
    fetchTopics();
  }, []);

  async function handleAddTopic(formData: FormData) {
    setIsLoading(true);
    const name = formData.get("topic") as string;
    if (!name || name.trim() === "") {
      toast.error("Topic name is required");
      setIsLoading(false);
      return;
    }

    try {
      const result = await addTopicDoc(name.trim());
      if (result.err) {
        toast.error(result.msg);
      } else {
        toast.success(result.msg);
        setTopics((prevTopics) => [result.data!, ...prevTopics]);
        setIsDialogOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Topic Manager</h1>
        <div className="flex items-center space-x-4">
          <div className="relative  ">
            <Input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <SearchIcon
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <PlusIcon className="mr-2 h-4 w-4" /> Add Topic
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold text-gray-700">
                  Add New Topic
                </DialogTitle>
              </DialogHeader>
              <form action={handleAddTopic} className="mt-4">
                <div className="flex items-center space-x-2">
                  <Input
                    name="topic"
                    placeholder="Enter topic name"
                    className="flex-grow"
                  />
                  <Button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Adding..." : "Add"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTopics.map((topic) => (
          <Link href={`/docs/${topic.id}`} key={topic.id} className="group">
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-xl transition-all duration-300 bg-white group-hover:bg-blue-50">
              <h3 className="font-bold text-xl mb-3 text-gray-800 group-hover:text-blue-600">
                {topic.name}
              </h3>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <p>Created: {formatDate(new Date(topic.createdAt))}</p>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <ClockIcon className="mr-2 h-4 w-4" />
                <p>Updated: {formatDate(new Date(topic.updatedAt))}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Toaster />
    </div>
  );
}
