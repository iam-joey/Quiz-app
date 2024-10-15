import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AddTopicForm from "./AddTopicForm";
import { deleteCategory, getTopics } from "@/src/lib/actions";
import Link from "next/link";
import { Button } from "../ui/button";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function deleteTopic(formData: FormData) {
  "use server";
  const topicId = formData.get("topicId") as string;
  const result = await deleteCategory(topicId);
  if (result.err) {
    console.error(result.msg);
  } else {
    revalidatePath("/topics");
  }
}

export default async function TopicList() {
  const topics = await getTopics();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Topic List</h1>
        <AddTopicForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {topics.data.map((topic: any) => (
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
              <Link href={`/topics/${topic.id}`} passHref>
                <Button variant="outline">View Questions</Button>
              </Link>
              <form action={deleteTopic}>
                <input type="hidden" name="topicId" value={topic.id} />
                <Button type="submit" variant="destructive">
                  Delete
                </Button>
              </form>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
