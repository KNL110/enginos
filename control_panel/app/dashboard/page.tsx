"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { useLogout, useSession } from "@/hooks/useSession";

export default function DashboardPage() {
    const router = useRouter();
    const { user, isLoading } = useSession();
    const logoutMutation = useLogout();

    // The middleware guard only checks for the `hasSession` cookie, not a
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
        <div className="relative flex min-h-svh flex-1 flex-col overflow-hidden bg-background">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black,transparent)] [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:32px_32px]"
            />

            <header className="relative flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    devpilot
                </div>

                <div className="flex items-center gap-3">
                    <Avatar size="sm">
                        {user.avatarUrl && (
                            <AvatarImage src={user.avatarUrl} alt={user.username} />
                        )}
                        <AvatarFallback>
                            {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-mono text-sm">{user.username}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => logoutMutation.mutate()}
                        disabled={logoutMutation.isPending}
                    >
                        {logoutMutation.isPending ? <Spinner /> : "Log out"}
                    </Button>
                </div>
            </header>

            <main className="relative flex flex-1 items-center justify-center px-6">
                <p className="font-mono text-sm text-muted-foreground">
                    Nothing here yet — dashboard content coming soon.
                </p>
            </main>
        </div>
    );
}
