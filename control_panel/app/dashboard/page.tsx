"use client";

import { useMemo, useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RepoCard } from "@/components/dashboard/repo-card";
import { MOCK_REPOS, type RepoStatus } from "@/lib/mock-repos";

type VisibilityFilter = "all" | "public" | "private";
type StatusFilter = "all" | RepoStatus;

export default function DashboardPage() {
    const [search, setSearch] = useState("");
    const [visibility, setVisibility] = useState<VisibilityFilter>("all");
    const [status, setStatus] = useState<StatusFilter>("all");

    const repos = useMemo(() => {
        const query = search.trim().toLowerCase();
        return MOCK_REPOS.filter((repo) => {
            if (visibility !== "all" && repo.visibility !== visibility) return false;
            if (status !== "all" && repo.status !== status) return false;
            if (query && !repo.name.toLowerCase().includes(query)) return false;
            return true;
        });
    }, [search, visibility, status]);

    const readyCount = MOCK_REPOS.filter((repo) => repo.status === "ready").length;

    return (
        <div className="flex flex-col gap-6 px-6 py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Repositories</h1>
                    <p className="text-sm text-muted-foreground">
                        {MOCK_REPOS.length} connected · {readyCount} ready
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
                    <Button variant="outline" disabled title="Not wired up yet — no sync backend">
                        <RefreshCw />
                        Sync
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
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

                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Tabs value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="ready">Ready</TabsTrigger>
                            <TabsTrigger value="indexing">Indexing</TabsTrigger>
                            <TabsTrigger value="new">New</TabsTrigger>
                            <TabsTrigger value="failed">Failed</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {repos.map((repo) => (
                    <RepoCard key={repo.id} repo={repo} />
                ))}

                {repos.length === 0 && (
                    <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
                        No repositories match these filters.
                    </p>
                )}
            </div>
        </div>
    );
}
