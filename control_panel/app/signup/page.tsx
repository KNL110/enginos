"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GitBranch, MessageSquareCode, Workflow } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { GithubIcon } from "@/components/icons/github-icon";
import { githubLoginUrl } from "@/lib/api";
import { useSession, useSignup } from "@/hooks/useSession";
import { cn } from "@/lib/utils";

const FEATURES = [
    { icon: GitBranch, label: "Connect and index your repositories" },
    { icon: MessageSquareCode, label: "Ask questions about your codebase" },
    { icon: Workflow, label: "Manage your DevOps pipelines" },
];

export default function SignupPage() {
    const router = useRouter();
    const { user, isLoading } = useSession();
    const signupMutation = useSignup();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [justSignedUp, setJustSignedUp] = useState(false);

    useEffect(() => {
        if (user && !justSignedUp) {
            router.replace("/dashboard");
        }
    }, [user, justSignedUp, router]);

    const handleSignup = (e: React.SubmitEvent) => {
        e.preventDefault();
        signupMutation.mutate(
            { email, password },
            { onSuccess: () => setJustSignedUp(true) }
        );
    };

    const showSpinner = isLoading || (!!user && !justSignedUp);

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
                    {justSignedUp ? (
                        <>
                            <CardTitle className="text-3xl">Connect GitHub?</CardTitle>
                            <CardDescription className="font-mono text-sm">
                                $ devpilot connect --provider github
                            </CardDescription>
                        </>
                    ) : (
                        <>
                            <CardTitle className="text-3xl">Create your account</CardTitle>
                            <CardDescription className="font-mono text-sm">
                                $ signup --provider email
                            </CardDescription>
                        </>
                    )}
                </CardHeader>

                <CardContent className="flex flex-col items-center gap-6 py-6">
                    {showSpinner ? (
                        <Spinner className="size-6 text-muted-foreground" />
                    ) : justSignedUp ? (
                        <>
                            <p className="text-center text-sm text-muted-foreground">
                                Connect a GitHub account now to index your repositories, or do it later from
                                settings.
                            </p>
                            <a
                                href={githubLoginUrl}
                                className={cn(buttonVariants({ size: "lg" }), "h-12 w-full gap-2 text-base")}
                            >
                                <GithubIcon className="size-5" />
                                Connect GitHub
                            </a>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={() => router.push("/dashboard")}
                            >
                                Later
                            </Button>
                        </>
                    ) : (
                        <>
                            <form onSubmit={handleSignup} className="w-full">
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
                                            minLength={8}
                                            autoComplete="new-password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </Field>
                                    {signupMutation.isError && (
                                        <FieldError>{signupMutation.error.message}</FieldError>
                                    )}
                                    <Button type="submit" className="w-full" disabled={signupMutation.isPending}>
                                        {signupMutation.isPending ? <Spinner className="size-4" /> : "Sign up"}
                                    </Button>
                                </FieldGroup>
                            </form>

                            <p className="text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link href="/login" className="text-foreground underline underline-offset-4">
                                    Sign in
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
