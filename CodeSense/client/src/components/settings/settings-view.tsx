"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { FaGithub } from "react-icons/fa";

import { PageHeading } from "@/components/layout/page-heading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-auth";

export function SettingsView() {
  const { data: user } = useCurrentUser();
  const { theme, setTheme } = useTheme();
  const initials = (user?.displayName || user?.githubUsername || "DG").slice(0, 2).toUpperCase();
  return (
    <div className="mx-auto w-full max-w-4xl p-5 sm:p-7 lg:p-9">
      <PageHeading eyebrow="Preferences" title="Settings" description="Manage local appearance and review the GitHub account attached to this session." />
      <div className="mt-7 space-y-5">
        <section className="rounded-xl border bg-card p-5 shadow-sm sm:p-6"><h2 className="font-semibold">Connected account</h2><div className="mt-5 flex items-center gap-4"><Avatar className="size-11"><AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName} /><AvatarFallback>{initials}</AvatarFallback></Avatar><div><p className="text-sm font-medium">{user?.displayName}</p><p className="text-sm text-muted-foreground">@{user?.githubUsername}</p></div><FaGithub className="ml-auto size-5 text-muted-foreground" /></div></section>
        <section className="rounded-xl border bg-card p-5 shadow-sm sm:p-6"><h2 className="font-semibold">Appearance</h2><p className="mt-1 text-sm text-muted-foreground">Theme preference is saved on this device.</p><div className="mt-5 grid gap-2 sm:grid-cols-3">{[{ id: "light", label: "Light", icon: Sun }, { id: "dark", label: "Dark", icon: Moon }, { id: "system", label: "System", icon: Laptop }].map((option) => <Button key={option.id} variant={theme === option.id ? "default" : "outline"} className="justify-start" onClick={() => setTheme(option.id)}><option.icon />{option.label}</Button>)}</div></section>
      </div>
    </div>
  );
}
