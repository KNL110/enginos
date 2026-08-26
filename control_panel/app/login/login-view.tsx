"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GitBranch, MessageSquareCode, Workflow } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { GithubIcon } from "@/components/icons/github-icon";
import { githubLoginUrl } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
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

const FEATURES = [
    { icon: GitBranch, label: "Connect and index your repositories" },
    { icon: MessageSquareCode, label: "Ask questions about your codebase" },
    { icon: Workflow, label: "Manage your DevOps pipelines" },
];

export function LoginView() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const errorCode = searchParams.get("error");
    const { user, isLoading } = useSession();

    // A fresh login already lands on /dashboard directly (the backend
    // redirects there once the session is issued) — this is for someone
    // navigating back to /login while already holding a valid session.
    useEffect(() => {
        if (user) {
            router.replace("/dashboard");
        }
    }, [user, router]);

    const showSpinner = isLoading || !!user;

    return (
        <div className="relative flex min-h-svh flex-1 items-center justify-center overflow-hidden bg-background px-4 py-16">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)] [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:32px_32px]"
            />

            <Card className="relative w-full max-w-sm">
                <CardHeader className="items-center gap-4 text-center">
                    <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
                        <span className="size-2 animate-pulse rounded-full bg-primary" />
                        devpilot
                    </div>
                    <CardTitle className="text-3xl">Sign in to DevPilot</CardTitle>
                    <CardDescription className="font-mono text-sm">
                        $ authenticate --provider github
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col items-center gap-6 py-6">
                    {showSpinner ? (
                        <Spinner className="size-6 text-muted-foreground" />
                    ) : (
                        <>
                            <a
                                href={githubLoginUrl}
                                className={cn(buttonVariants({ size: "lg" }), "h-12 w-full gap-2 text-base")}
                            >
                                <GithubIcon className="size-5" />
                                Continue with GitHub
                            </a>

                            <div className="w-full space-y-3 border-t border-border pt-6">
                                {FEATURES.map(({ icon: Icon, label }) => (
                                    <div
                                        key={label}
                                        className="flex items-center gap-3 font-mono text-sm text-muted-foreground"
                                    >
                                        <Icon className="size-4 shrink-0 text-foreground" />
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {errorCode && !showSpinner && (
                        <p className="w-full rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-center text-sm text-destructive">
                            {ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.oauth_failed}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
