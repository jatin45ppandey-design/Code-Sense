import { RepositoryDetail } from "@/components/repositories/repository-detail";

export default async function RepositoryPage({ params }: { params: Promise<{ repoId: string }> }) {
  const { repoId } = await params;
  return <RepositoryDetail repositoryId={repoId} />;
}
