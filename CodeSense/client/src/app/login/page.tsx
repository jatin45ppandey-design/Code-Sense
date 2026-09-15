import { LoginPanel } from "@/components/auth/login-panel";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <LoginPanel error={error} />;
}
