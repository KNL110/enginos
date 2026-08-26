"use client";

import { ArrowRight, GitBranch, Lock, MessageSquare, RotateCcw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/icons/github-icon";
import { LanguageIcon } from "@/components/icons/language-icon";
import { cn } from "@/lib/utils";
import type { MockRepo, RepoStatus } from "@/lib/mock-repos";

const STATUS_LABEL: Record<RepoStatus, string> = {
    ready: "Ready",
    indexing: "Indexing",
    new: "Not indexed",
    failed: "Failed",
};

const STATUS_BADGE_VARIANT: Record<RepoStatus, "default" | "secondary" | "outline" | "destructive"> = {
    ready: "default",
    indexing: "secondary",
    new: "outline",
    failed: "destructive",
};

export function RepoCard({ repo }: { repo: MockRepo }) {
    const isFailed = repo.status === "failed";
    const isIndexing = repo.status === "indexing";
    const isReady = repo.status === "ready";

    return (
        <article
            className={cn(
                "group flex flex-col overflow-hidden rounded-2xl border border-dashed bg-card/80 shadow-md shadow-foreground/5 transition-all",
                isFailed
                    ? "border-destructive/30 bg-destructive/2 hover:border-destructive/40"
                    : "border-border/80 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-lg hover:shadow-foreground/10"
            )}
        >
            <div className="border-b border-dashed border-border/70 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                        <LanguageIcon language={repo.language} />
                        <div className="min-w-0">
                            <p className="truncate text-xs text-muted-foreground">{repo.owner}</p>
                            <h3 className="truncate font-medium">{repo.name}</h3>
                        </div>
                    </div>
                    <Badge variant={STATUS_BADGE_VARIANT[repo.status]}>
                        {isIndexing && (
                            <span className="mr-1 size-1.5 animate-pulse rounded-full bg-current" />
                        )}
                        {STATUS_LABEL[repo.status]}
                    </Badge>
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4">
                <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
                    {repo.description ?? "No description provided."}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                    {repo.visibility === "private" && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground">
                            <Lock className="size-3" />
                            Private
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground">
                        <GitBranch className="size-3" />
                        {repo.branch}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed px-2 py-0.5 text-xs">
                        {repo.language}
                    </span>
                    {isReady && repo.chunks != null && (
                        <span className="rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground">
                            {repo.chunks.toLocaleString()} chunks
                        </span>
                    )}
                </div>
            </div>

            <div className="mt-auto flex items-center justify-between gap-2 border-t border-dashed border-border/70 p-4">
                <Button
                    variant="ghost"
                    size="sm"
                    nativeButton={false}
                    render={<a href="#" onClick={(e) => e.preventDefault()} />}
                >
                    <GithubIcon className="size-4" data-icon="inline-start" />
                    GitHub
                </Button>

                <div className="flex gap-2">
                    {isReady && (
                        <Button variant="secondary" size="sm">
                            <MessageSquare data-icon="inline-start" />
                            Chat
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant={isFailed ? "outline" : "default"}
                        className={cn(isFailed && "border-destructive/30 text-destructive hover:bg-destructive/10")}
                        disabled={isIndexing}
                    >
                        {isIndexing ? (
                            "Indexing…"
                        ) : isReady ? (
                            <>
                                Open
                                <ArrowRight data-icon="inline-end" />
                            </>
                        ) : isFailed ? (
                            <>
                                <RotateCcw data-icon="inline-start" />
                                Retry
                            </>
                        ) : (
                            <>
                                <Sparkles data-icon="inline-start" />
                                Index
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </article>
    );
}
