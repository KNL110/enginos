"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { GithubIcon } from "@/components/icons/github-icon";
import { githubLoginUrl } from "@/lib/api";
import { useSession, useUpdateSettings } from "@/hooks/useSession";
import { cn } from "@/lib/utils";

export function SettingsView() {
    const searchParams = useSearchParams();
    const justConnectedGithub = searchParams.get("github") === "connected";
    const { user } = useSession();
    const updateSettingsMutation = useUpdateSettings();

    const [username, setUsername] = useState(user?.username ?? "");
    const [password, setPassword] = useState("");

    // The parent dashboard layout only renders this page once a session is
    // confirmed, so `user` is never null in practice here.
    if (!user) return null;

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        const updates: { username?: string; password?: string } = {};
        if (username !== user.username) updates.username = username;
        if (password) updates.password = password;

        if (Object.keys(updates).length === 0) return;

        updateSettingsMutation.mutate(updates, {
            onSuccess: () => setPassword(""),
        });
    };

    return (
        <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
            <div>
                <h1 className="text-2xl font-semibold">Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your account details.</p>
            </div>

            {justConnectedGithub && (
                <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm text-primary">
                    <CheckCircle2 className="size-4 shrink-0" />
                    GitHub connected.
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:flex-row">
                <div className="flex shrink-0 flex-col items-center gap-3">
                    <Avatar className="size-20">
                        {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.username} />}
                        <AvatarFallback className="text-lg">
                            {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    {user.githubConnected ? (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <GithubIcon className="size-3.5" />
                            GitHub connected
                        </span>
                    ) : (
                        <a
                            href={githubLoginUrl}
                            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
                        >
                            <GithubIcon className="size-3.5" />
                            Connect GitHub
                        </a>
                    )}
                </div>

                <FieldGroup className="flex-1">
                    <Field>
                        <FieldLabel htmlFor="username">Username</FieldLabel>
                        <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input id="email" value={user.email ?? ""} disabled />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="password">
                            {user.hasPassword ? "Change password" : "Set a password"}
                        </FieldLabel>
                        <Input
                            id="password"
                            type="password"
                            minLength={8}
                            placeholder={user.hasPassword ? "Leave blank to keep current password" : ""}
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Field>

                    {updateSettingsMutation.isError && (
                        <FieldError>{updateSettingsMutation.error.message}</FieldError>
                    )}
                    {updateSettingsMutation.isSuccess && (
                        <p className="text-sm text-primary">Saved.</p>
                    )}

                    <Button type="submit" className="w-fit" disabled={updateSettingsMutation.isPending}>
                        {updateSettingsMutation.isPending ? <Spinner className="size-4" /> : "Save changes"}
                    </Button>
                </FieldGroup>
            </form>
        </div>
    );
}
