"use client";

import { GitBranch, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/icons/github-icon";
import type { Repo } from "@/lib/api";

export const formatRelativeTime = (iso: string | null): string => {
    if (!iso) return "unknown";
    const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
    const diffYears = Math.floor(diffMonths / 12);
    return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
};

const MAX_VISIBLE_LANGUAGES = 3;

export function RepoCard({ repo }: { repo: Repo }) {
    const languages = repo.languages ?? [];
    const visibleLanguages = languages.slice(0, MAX_VISIBLE_LANGUAGES);
    const hiddenLanguageCount = languages.length - visibleLanguages.length;

    return (
        <article className="flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/80 shadow-md shadow-foreground/5 transition-all hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-lg hover:shadow-foreground/10">
            <div className="flex flex-col gap-1 border-b border-border/70 p-4">
                <p className="truncate text-xs text-muted-foreground">{repo.owner}</p>
                <h3 className="truncate font-medium">{repo.name}</h3>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4">
                <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
                    {repo.description ?? "No description provided."}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                    {repo.private && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground">
                            <Lock className="size-3" />
                            Private
                        </span>
                    )}
                    {repo.defaultBranch && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground">
                            <GitBranch className="size-3" />
                            {repo.defaultBranch}
                        </span>
                    )}
                    {visibleLanguages.map((language) => (
                        <span
                            key={language}
                            className="inline-flex items-center gap-1.5 rounded-full border border-dashed px-2 py-0.5 text-xs"
                        >
                            {language}
                        </span>
                    ))}
                    {hiddenLanguageCount > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground">
                            +{hiddenLanguageCount}
                        </span>
                    )}
                </div>

                <p className="text-xs text-muted-foreground">
                    Updated {formatRelativeTime(repo.githubUpdatedAt)} · Not indexed yet
                </p>
            </div>

            <div className="flex items-center justify-end border-t border-border/70 p-4">
                <Button
                    variant="ghost"
                    size="sm"
                    nativeButton={false}
                    render={<a href={repo.htmlUrl} target="_blank" rel="noreferrer" />}
                >
                    <GithubIcon className="size-4" data-icon="inline-start" />
                    GitHub
                </Button>
            </div>
        </article>
    );
}
