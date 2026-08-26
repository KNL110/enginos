import { and, desc, eq, notInArray } from "drizzle-orm";
import db from "../db/db.js";
import { repos } from "../db/schema/repos.js";
import { authProviders } from "../db/schema/authProviders.js";
import { ApiError } from "../utils/ApiError.js";
import { fetchGithubApi } from "./github.service.js";

interface GithubRepoResponse {
    id: number;
    name: string;
    full_name: string;
    owner: { login: string };
    description: string | null;
    private: boolean;
    language: string | null;
    default_branch: string;
    html_url: string;
    updated_at: string | null;
}

const PER_PAGE = 100;
// Safety cap, not a real expectation — bounds worst-case sync time/memory
// for an account with an unusually large number of repos.
const MAX_PAGES = 5;

const fetchAllGithubRepos = async (accessToken: string): Promise<GithubRepoResponse[]> => {
    const allRepos: GithubRepoResponse[] = [];

    for (let page = 1; page <= MAX_PAGES; page++) {
        const response = await fetchGithubApi(accessToken, `/user/repos?per_page=${PER_PAGE}&page=${page}&sort=updated`);

        if (!response.ok) {
            throw new ApiError(502, "Couldn't reach GitHub to sync repositories");
        }

        const pageRepos = (await response.json()) as GithubRepoResponse[];
        allRepos.push(...pageRepos);

        if (pageRepos.length < PER_PAGE) break;
    }

    return allRepos;
};

// GitHub's repo listing only gives one "primary" language — the full
// breakdown is a separate per-repo call, so this is fetched for every synced
// repo in parallel. Best-effort: a single repo's languages call failing
// shouldn't fail the whole sync, so it falls back to just the primary
// language (or nothing) instead of throwing.
const fetchRepoLanguages = async (accessToken: string, repo: GithubRepoResponse): Promise<string[]> => {
    try {
        const response = await fetchGithubApi(accessToken, `/repos/${repo.full_name}/languages`);
        if (!response.ok) {
            return repo.language ? [repo.language] : [];
        }
        const bytesByLanguage = (await response.json()) as Record<string, number>;
        return Object.entries(bytesByLanguage)
            .sort(([, a], [, b]) => b - a)
            .map(([name]) => name);
    } catch {
        return repo.language ? [repo.language] : [];
    }
};

export const syncReposForUser = async (userId: string) => {
    const [authProvider] = await db
        .select({ accessToken: authProviders.accessToken, provider: authProviders.provider })
        .from(authProviders)
        .where(eq(authProviders.userId, userId));

    if (!authProvider || authProvider.provider !== "github" || !authProvider.accessToken) {
        throw new ApiError(400, "Connect GitHub to sync repositories");
    }

    const accessToken = authProvider.accessToken;

    const githubRepos = await fetchAllGithubRepos(accessToken);
    const githubRepoIds = githubRepos.map((repo) => repo.id);
    const languagesByRepoId = new Map(
        await Promise.all(
            githubRepos.map(async (repo) => [repo.id, await fetchRepoLanguages(accessToken, repo)] as const)
        )
    );

    await db.transaction(async (tx) => {
        for (const repo of githubRepos) {
            const values = {
                userId,
                githubRepoId: repo.id,
                owner: repo.owner.login,
                name: repo.name,
                fullName: repo.full_name,
                description: repo.description,
                private: repo.private,
                languages: languagesByRepoId.get(repo.id) ?? (repo.language ? [repo.language] : []),
                defaultBranch: repo.default_branch,
                htmlUrl: repo.html_url,
                githubUpdatedAt: repo.updated_at ? new Date(repo.updated_at) : null,
            };

            await tx
                .insert(repos)
                .values(values)
                .onConflictDoUpdate({
                    target: [repos.userId, repos.githubRepoId],
                    set: { ...values, updatedAt: new Date() },
                });
        }

        // Reconcile: drop rows for repos no longer returned (deleted, or
        // access revoked, since the last sync).
        if (githubRepoIds.length > 0) {
            await tx
                .delete(repos)
                .where(and(eq(repos.userId, userId), notInArray(repos.githubRepoId, githubRepoIds)));
        } else {
            await tx.delete(repos).where(eq(repos.userId, userId));
        }
    });

    return db.select().from(repos).where(eq(repos.userId, userId)).orderBy(desc(repos.githubUpdatedAt));
};

export const listReposForUser = (userId: string) => {
    return db.select().from(repos).where(eq(repos.userId, userId)).orderBy(desc(repos.githubUpdatedAt));
};
