"use client";

import { useSearchParams } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { GithubIcon } from "@/components/icons/github-icon";
import { githubLoginUrl } from "@/lib/api";
import { useLogout, useSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";

const ERROR_MESSAGES: Record<string, string> = {
    missing_code: "GitHub didn't send back an authorization code. Try again.",
    github_unreachable: "Couldn't reach GitHub. Check your connection and try again.",
    profile_unreachable: "Couldn't load your GitHub profile. Try again.",
    profile_invalid: "GitHub returned an unexpected profile response. Try again.",
    access_denied: "You cancelled the GitHub authorization.",
    bad_verification_code: "That authorization code expired. Try signing in again.",
    oauth_failed: "Something went wrong signing in with GitHub. Try again.",
};

export function LoginView() {
    const searchParams = useSearchParams();
    const errorCode = searchParams.get("error");
    const { user, isLoading } = useSession();
    const logoutMutation = useLogout();

    return (
        <div className="relative flex min-h-svh flex-1 items-center justify-center overflow-hidden bg-background px-4 py-16">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)] [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:32px_32px]"
            />

            <Card className="relative w-full max-w-sm">
                <CardHeader className="items-center gap-3 text-center">
                    <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                        <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                        devpilot
                    </div>
                    <CardTitle className="text-xl">
                        {user ? "You're signed in" : "Sign in to DevPilot"}
                    </CardTitle>
                    <CardDescription className="font-mono text-xs">
                        {user ? `~/${user.username}` : "$ authenticate --provider github"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col items-center gap-4">
                    {isLoading ? (
                        <Spinner className="size-5 text-muted-foreground" />
                    ) : user ? (
                        <>
                            <Avatar size="lg">
                                {user.avatarUrl && (
                                    <AvatarImage src={user.avatarUrl} alt={user.username} />
                                )}
                                <AvatarFallback>
                                    {user.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => logoutMutation.mutate()}
                                disabled={logoutMutation.isPending}
                            >
                                {logoutMutation.isPending ? <Spinner /> : "Log out"}
                            </Button>
                        </>
                    ) : (
                        <a
                            href={githubLoginUrl}
                            className={cn(buttonVariants({ size: "lg" }), "w-full gap-2")}
                        >
                            <GithubIcon className="size-4" />
                            Continue with GitHub
                        </a>
                    )}

                    {errorCode && !user && !isLoading && (
                        <p className="w-full rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
                            {ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.oauth_failed}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
