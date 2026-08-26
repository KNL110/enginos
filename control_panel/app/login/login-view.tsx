"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GitBranch, MessageSquareCode, Workflow } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { GithubIcon } from "@/components/icons/github-icon";
import { githubLoginUrl } from "@/lib/api";
import { useLogin, useSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";

const ERROR_MESSAGES: Record<string, string> = {
    missing_code: "GitHub didn't send back an authorization code. Try again.",
    github_unreachable: "Couldn't reach GitHub. Check your connection and try again.",
    profile_unreachable: "Couldn't load your GitHub profile. Try again.",
    profile_invalid: "GitHub returned an unexpected profile response. Try again.",
    access_denied: "You cancelled the GitHub authorization.",
    bad_verification_code: "That authorization code expired. Try signing in again.",
    oauth_failed: "Something went wrong signing in with GitHub. Try again.",
    github_already_linked: "That GitHub account is already connected to a different ENGINOS account.",
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
    const loginMutation = useLogin();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // A fresh login already lands on /dashboard directly (the backend
    // redirects there once the session is issued) — this is for someone
    // navigating back to /login while already holding a valid session.
    useEffect(() => {
        if (user) {
            router.replace("/dashboard");
        }
    }, [user, router]);

    // A failed link attempt (e.g. github_already_linked) leaves the existing
    // session intact, so the effect above redirects to /dashboard almost
    // immediately — an inline banner on this page would flash and vanish
    // before anyone could read it. The toast is mounted at the root layout,
    // so it survives that redirect and stays visible regardless.
    //
    // shownErrorRef guards against firing twice for the same code — without
    // it, React StrictMode's dev-only double-invoke of effects on mount adds
    // two overlapping toasts (confirmed live: two identical dialogs stacked
    // on top of each other, easy to miss for exactly that reason).
    const shownErrorRef = useRef<string | null>(null);
    useEffect(() => {
        if (!errorCode || shownErrorRef.current === errorCode) return;
        shownErrorRef.current = errorCode;
        toast.add({
            title: errorCode === "github_already_linked" ? "GitHub account already connected" : "Sign-in failed",
            description: ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.oauth_failed,
            type: "error",
            timeout: 10000,
        });
    }, [errorCode]);

    const handlePasswordLogin = (e: React.SubmitEvent) => {
        e.preventDefault();
        loginMutation.mutate({ email, password });
    };

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
                        enginos
                    </div>
                    <CardTitle className="text-3xl">Sign in to ENGINOS</CardTitle>
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

                            <FieldSeparator className="w-full">or continue with email</FieldSeparator>

                            <form onSubmit={handlePasswordLogin} className="w-full">
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="email">Email</FieldLabel>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="password">Password</FieldLabel>
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </Field>
                                    {loginMutation.isError && (
                                        <FieldError>{loginMutation.error.message}</FieldError>
                                    )}
                                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                                        {loginMutation.isPending ? <Spinner className="size-4" /> : "Sign in"}
                                    </Button>
                                </FieldGroup>
                            </form>

                            <p className="text-sm text-muted-foreground">
                                Don&apos;t have an account?{" "}
                                <Link href="/signup" className="text-foreground underline underline-offset-4">
                                    Sign up
                                </Link>
                            </p>

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
                </CardContent>
            </Card>
        </div>
    );
}
