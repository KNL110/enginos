"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RepoCard } from "@/components/dashboard/repo-card";
import { GithubIcon } from "@/components/icons/github-icon";
import { githubLoginUrl } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import { useRepos, useSyncRepos } from "@/hooks/useRepos";
import { cn } from "@/lib/utils";

type VisibilityFilter = "all" | "public" | "private";

export default function DashboardPage() {
    const { user } = useSession();
    const githubConnected = user?.githubConnected ?? false;

    const reposQuery = useRepos();
    const syncMutation = useSyncRepos();

    const [search, setSearch] = useState("");
    const [visibility, setVisibility] = useState<VisibilityFilter>("all");

    const repos = reposQuery.data ?? [];

    const filteredRepos = useMemo(() => {
        const query = search.trim().toLowerCase();
        return (reposQuery.data ?? []).filter((repo) => {
            if (visibility === "public" && repo.private) return false;
            if (visibility === "private" && !repo.private) return false;
            if (query && !repo.name.toLowerCase().includes(query)) return false;
            return true;
        });
    }, [reposQuery.data, search, visibility]);

    if (!githubConnected) {
        return (
            <div className="flex flex-col gap-6 px-6 py-6">
                <div>
                    <h1 className="text-2xl font-semibold">Repositories</h1>
                    <p className="text-sm text-muted-foreground">
                        Connect and index your repositories to get started.
                    </p>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed py-24 text-center">
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Connect GitHub to see your repositories here.
                    </p>
                    <a href={githubLoginUrl} className={cn(buttonVariants(), "gap-2")}>
                        <GithubIcon className="size-4" />
                        Connect GitHub
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 px-6 py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Repositories</h1>
                    <p className="text-sm text-muted-foreground">
                        {repos.length} connected
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <InputGroup className="w-64">
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                        <InputGroupInput
                            placeholder="Search repositories..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </InputGroup>
                    <Button
                        variant="outline"
                        disabled={syncMutation.isPending}
                        onClick={() => syncMutation.mutate()}
                    >
                        <RefreshCw className={cn(syncMutation.isPending && "animate-spin")} />
                        Sync
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Visibility</span>
                <Tabs value={visibility} onValueChange={(v) => setVisibility(v as VisibilityFilter)}>
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="public">Public</TabsTrigger>
                        <TabsTrigger value="private">Private</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {reposQuery.isLoading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-44 rounded-2xl" />
                    ))}
                </div>
            ) : repos.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed py-24 text-center">
                    <p className="max-w-sm text-sm text-muted-foreground">
                        No repositories yet — hit Sync to pull them in from GitHub.
                    </p>
                    <Button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
                        <RefreshCw className={cn(syncMutation.isPending && "animate-spin")} />
                        Sync
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredRepos.map((repo) => (
                        <RepoCard key={repo.id} repo={repo} />
                    ))}

                    {filteredRepos.length === 0 && (
                        <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
                            No repositories match these filters.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
