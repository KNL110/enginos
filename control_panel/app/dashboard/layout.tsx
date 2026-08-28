"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, FolderGit2, Settings as SettingsIcon } from "lucide-react";
import {
    SidebarProvider,
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { useLogout, useSession } from "@/hooks/useSession";

const NAV_GROUPS = [
    {
        label: "Workspace",
        items: [
            { label: "Overview", icon: LayoutGrid, href: "/dashboard/overview" },
            { label: "Repositories", icon: FolderGit2, href: "/dashboard" },
        ],
    },
    {
        label: "Account",
        items: [{ label: "Settings", icon: SettingsIcon, href: "/dashboard/settings" }],
    },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isLoading } = useSession();
    const logoutMutation = useLogout();

    // The proxy guard only checks for the `hasSession` cookie, not a
    // verified session — this is the authoritative check, for the case
    // where the cookie is present but the session it points at is stale.
    useEffect(() => {
        if (!isLoading && !user) {
            router.replace("/login");
        }
    }, [isLoading, user, router]);

    if (isLoading || !user) {
        return (
            <div className="flex min-h-svh flex-1 items-center justify-center bg-background">
                <Spinner className="size-6 text-muted-foreground" />
            </div>
        );
    }

    return (
        <SidebarProvider>
            <Sidebar variant="inset" collapsible="icon">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-primary">
                                    <Image
                                        src="/enginos-mark.png"
                                        alt=""
                                        width={32}
                                        height={32}
                                        className="size-6 object-contain"
                                    />
                                </span>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-mono font-semibold">enginos</span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        Chat with your code
                                    </span>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    {NAV_GROUPS.map((group) => (
                        <SidebarGroup key={group.label}>
                            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                            <SidebarMenu>
                                {group.items.map(({ label, icon: Icon, href }) => (
                                    <SidebarMenuItem key={href}>
                                        <SidebarMenuButton
                                            render={<Link href={href} />}
                                            isActive={pathname === href}
                                        >
                                            <Icon />
                                            {label}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroup>
                    ))}
                </SidebarContent>

                <SidebarFooter>
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <button
                                    type="button"
                                    className="flex w-full items-center gap-2 rounded-md p-2 text-left outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring"
                                />
                            }
                        >
                            <Avatar size="sm">
                                {user.avatarUrl && (
                                    <AvatarImage src={user.avatarUrl} alt={user.username} />
                                )}
                                <AvatarFallback>
                                    {user.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="truncate font-mono text-sm">{user.username}</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" side="top">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled>Profile</DropdownMenuItem>
                            <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => logoutMutation.mutate()}
                                disabled={logoutMutation.isPending}
                            >
                                {logoutMutation.isPending ? <Spinner className="size-4" /> : "Sign out"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarFooter>
            </Sidebar>

            <SidebarInset className="relative overflow-hidden">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black,transparent)] [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:32px_32px]"
                />

                <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex flex-1 justify-end">
                        <ModeToggle />
                    </div>
                </header>

                <main className="relative flex-1">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}
