import { getTopics } from "@/src/lib/actions";
import TopicList from "./TopicList";

export const dynamic = "force-dynamic";

export default async function TopicsPage() {
  const topics = await getTopics();
  return <TopicList initialTopics={topics.data} />;
}
