import { ChatView } from "@/components/chat/chat-view";

export default async function ChatPage({ params }: { params: Promise<{ repoId: string }> }) {
  const { repoId } = await params;
  return <ChatView repositoryId={repoId} />;
}
