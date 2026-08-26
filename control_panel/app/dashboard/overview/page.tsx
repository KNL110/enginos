"use client";

import Link from "next/link";
import { FolderGit2, Globe, Lock, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RepoCard, formatRelativeTime } from "@/components/dashboard/repo-card";
import { GithubIcon } from "@/components/icons/github-icon";
import { githubLoginUrl } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import { useRepos } from "@/hooks/useRepos";
import { cn } from "@/lib/utils";

const STAT_TONE_CLASSES = {
    primary: "bg-primary/10 text-primary",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    muted: "bg-muted text-muted-foreground",
} as const;

function StatCard({
    label,
    value,
    hint,
    icon: Icon,
    tone = "muted",
}: {
    label: string;
    value: string | number;
    hint?: string;
    icon: typeof FolderGit2;
    tone?: keyof typeof STAT_TONE_CLASSES;
}) {
    return (
        <Card size="sm">
            <CardHeader className="pb-0">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <CardDescription>{label}</CardDescription>
                        <CardTitle className="mt-1 text-2xl font-semibold">{value}</CardTitle>
                    </div>
                    <div className={cn("rounded-lg p-2", STAT_TONE_CLASSES[tone])}>
                        <Icon className="size-4" />
                    </div>
                </div>
            </CardHeader>
            {hint ? <CardContent className="pt-0 text-xs text-muted-foreground">{hint}</CardContent> : null}
        </Card>
    );
}

export default function OverviewPage() {
    const { user } = useSession();
    const githubConnected = user?.githubConnected ?? false;
    const reposQuery = useRepos();
    const repos = reposQuery.data ?? [];

    if (!githubConnected) {
        return (
            <div className="flex flex-col gap-6 px-6 py-6">
                <div>
                    <h1 className="text-2xl font-semibold">Overview</h1>
                    <p className="text-sm text-muted-foreground">Workspace stats and recent activity.</p>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed py-24 text-center">
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Connect GitHub to see your workspace overview here.
                    </p>
                    <a href={githubLoginUrl} className={cn(buttonVariants(), "gap-2")}>
                        <GithubIcon className="size-4" />
                        Connect GitHub
                    </a>
                </div>
            </div>
        );
    }

    const publicCount = repos.filter((repo) => !repo.private).length;
    const privateCount = repos.filter((repo) => repo.private).length;
    const publicPct = repos.length > 0 ? Math.round((publicCount / repos.length) * 100) : 0;
    const lastSyncedAt = repos.reduce<string | null>((latest, repo) => {
        // repos don't carry updatedAt on the frontend type, githubUpdatedAt is
        // the closest real signal we have without adding another field
        if (!latest) return repo.githubUpdatedAt;
        if (repo.githubUpdatedAt && repo.githubUpdatedAt > latest) return repo.githubUpdatedAt;
        return latest;
    }, null);
    const recentRepos = [...repos]
        .sort((a, b) => {
            const aTime = a.githubUpdatedAt ? new Date(a.githubUpdatedAt).getTime() : 0;
            const bTime = b.githubUpdatedAt ? new Date(b.githubUpdatedAt).getTime() : 0;
            return bTime - aTime;
        })
        .slice(0, 3);

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <div>
                <h1 className="text-2xl font-semibold">Overview</h1>
                <p className="text-sm text-muted-foreground">Workspace stats and recent activity.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {reposQuery.isLoading ? (
                    Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-2xl" />)
                ) : (
                    <>
                        <StatCard
                            label="Repositories"
                            value={repos.length}
                            hint="Synced from GitHub"
                            icon={FolderGit2}
                            tone="primary"
                        />
                        <StatCard label="Public" value={publicCount} icon={Globe} tone="blue" />
                        <StatCard label="Private" value={privateCount} icon={Lock} tone="amber" />
                        <StatCard
                            label="Last synced"
                            value={lastSyncedAt ? formatRelativeTime(lastSyncedAt) : "Never"}
                            hint="Hit Sync on Repositories to refresh"
                            icon={RefreshCw}
                            tone="muted"
                        />
                    </>
                )}
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <section className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold">Recent repositories</h2>
                            <p className="text-sm text-muted-foreground">Your most recently updated repos.</p>
                        </div>
                        <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
                            View all
                        </Link>
                    </div>

                    {reposQuery.isLoading ? (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                            {Array.from({ length: 2 }).map((_, index) => (
                                <Skeleton key={index} className="h-44 rounded-2xl" />
                            ))}
                        </div>
                    ) : recentRepos.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                            {recentRepos.map((repo) => (
                                <RepoCard key={repo.id} repo={repo} />
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>No repositories yet</CardTitle>
                                <CardDescription>Sync your GitHub repositories to see them here.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
                                    Go to repositories
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </section>

                <section className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold">Visibility</h2>
                        <p className="text-sm text-muted-foreground">Public vs. private across your connected repos.</p>
                    </div>

                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            {reposQuery.isLoading ? (
                                <Skeleton className="h-8 rounded-lg" />
                            ) : repos.length > 0 ? (
                                <>
                                    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full bg-blue-500 transition-all"
                                            style={{ width: `${publicPct}%` }}
                                        />
                                        <div
                                            className="h-full bg-amber-500 transition-all"
                                            style={{ width: `${100 - publicPct}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span className="size-2 rounded-full bg-blue-500" />
                                            Public
                                        </span>
                                        <Badge variant="secondary">{publicCount}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span className="size-2 rounded-full bg-amber-500" />
                                            Private
                                        </span>
                                        <Badge variant="secondary">{privateCount}</Badge>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">No repositories synced yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
}
