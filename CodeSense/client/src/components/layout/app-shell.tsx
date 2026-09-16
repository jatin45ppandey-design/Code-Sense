"use client";

import { FolderGit2, LayoutDashboard, LogOut, MessageSquareCode, Settings, Waypoints } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Brand } from "@/components/shared/brand";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";

const navigation = [
  { href: "/repositories", label: "Your Repositories", icon: FolderGit2 },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/external", label: "External Repositories", icon: Waypoints },
  { href: "/chat", label: "Ask CodeSense", icon: MessageSquareCode },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function routeTitle(pathname: string) {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/external") return "External Repositories";
  if (pathname === "/settings") return "Settings";
  if (pathname === "/chat" || pathname.startsWith("/chat/")) return "Ask CodeSense";
  if (pathname === "/repositories") return "Your Repositories";
  if (pathname.startsWith("/repositories/")) return "Repository Intelligence";
  return "CodeSense";
}

function WorkspaceNavigation() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenu>
      {navigation.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton render={<Link href={item.href} onClick={() => setOpenMobile(false)} />} isActive={isActive(pathname, item.href)} tooltip={item.label}>
            <item.icon />
            <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const initials = (user?.displayName || user?.githubUsername || "CS").slice(0, 2).toUpperCase();

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="pt-3 pb-2"><Brand className="w-full" /></SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] group-data-[collapsible=icon]:hidden">Workspace</SidebarGroupLabel>
            <SidebarGroupContent><WorkspaceNavigation /></SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator />
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="data-[popup-open]:bg-sidebar-accent" tooltip="Account" aria-label="Open account menu" />}>
                  <Avatar className="size-8 rounded-lg"><AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName || user?.githubUsername} /><AvatarFallback className="rounded-lg">{initials}</AvatarFallback></Avatar>
                  <span className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden"><span className="truncate text-sm font-medium">{user?.displayName}</span><span className="truncate text-xs text-muted-foreground">@{user?.githubUsername}</span></span>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-60">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal"><p className="text-sm font-medium">{user?.displayName}</p><p className="mt-0.5 text-xs text-muted-foreground">@{user?.githubUsername}</p><p className="mt-1 text-xs text-muted-foreground">Connected with GitHub</p></DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link href="/settings" />}><Settings /> Settings</DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="md:hidden" />
                  <DropdownMenuItem className="text-destructive focus:text-destructive md:hidden" onClick={() => logout.mutate()} disabled={logout.isPending}><LogOut /> {logout.isPending ? "Signing out..." : "Sign out"}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="min-w-0 overflow-hidden">
        <header className="sticky top-0 z-30 flex h-13 shrink-0 items-center gap-2 border-b border-border/75 bg-background/82 px-4 backdrop-blur-md">
          <SidebarTrigger className="-ml-1" />
          <Brand className="md:hidden" />
          <Separator orientation="vertical" className="mx-1 hidden h-4 md:block" />
          <div className="min-w-0 flex-1 text-sm font-medium text-foreground max-md:hidden">{routeTitle(pathname)}</div>
          <div className="flex items-center gap-1"><ThemeToggle /><Button variant="ghost" size="sm" className="hidden text-destructive hover:text-destructive md:inline-flex" onClick={() => logout.mutate()} disabled={logout.isPending}><LogOut /> {logout.isPending ? "Signing out..." : "Sign out"}</Button></div>
        </header>
        <div className="workspace-surface flex min-h-0 flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
