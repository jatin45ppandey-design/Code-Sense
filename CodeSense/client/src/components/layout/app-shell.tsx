"use client";

import { BookOpenText, Boxes, ExternalLink, LayoutDashboard, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Brand } from "@/components/shared/brand";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/repositories", label: "Repositories", icon: Boxes },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const initials = (user?.displayName || user?.githubUsername || "DG").slice(0, 2).toUpperCase();

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="pt-3"><Brand /></SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton render={<Link href={item.href} />} isActive={isActive(pathname, item.href, item.exact)} tooltip={item.label}>
                      <item.icon /><span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Resources</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<a href="https://github.com" target="_blank" rel="noreferrer" />} tooltip="GitHub">
                    <BookOpenText /><span>GitHub</span><ExternalLink className="ml-auto size-3 opacity-50" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="data-[popup-open]:bg-sidebar-accent" />}>
                  <Avatar className="size-8 rounded-lg"><AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName || user?.githubUsername} /><AvatarFallback className="rounded-lg">{initials}</AvatarFallback></Avatar>
                  <span className="grid flex-1 text-left leading-tight"><span className="truncate text-sm font-medium">{user?.displayName}</span><span className="truncate text-xs text-muted-foreground">@{user?.githubUsername}</span></span>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-60">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal"><p className="text-sm font-medium">{user?.displayName}</p><p className="text-xs text-muted-foreground">Connected with GitHub</p></DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link href="/settings" />}><Settings /> Settings</DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout.mutate()} disabled={logout.isPending}><LogOut /> {logout.isPending ? "Signing out…" : "Sign out"}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="min-w-0 overflow-hidden">
        <header className="sticky top-0 z-30 flex h-13 shrink-0 items-center gap-2 border-b bg-background/88 px-4 backdrop-blur-md">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-1 h-4" />
          <div className="min-w-0 flex-1 font-mono text-xs text-muted-foreground">{pathname.replace(/^\//, "") || "workspace"}</div>
          <ThemeToggle />
        </header>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
