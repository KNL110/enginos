"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listRepos, syncRepos, type Repo } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { useSession } from "@/hooks/useSession";

const REPOS_QUERY_KEY = ["repos"];

export function useRepos() {
    const { user } = useSession();

    return useQuery({
        queryKey: REPOS_QUERY_KEY,
        queryFn: listRepos,
        enabled: !!user?.githubConnected,
    });
}

export function useSyncRepos() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            toast.promise(syncRepos(), {
                loading: { title: "Syncing repositories", description: "Fetching the latest repos from GitHub…", type: "loading" },
                success: (repos: Repo[]) => ({
                    title: "Sync successful",
                    description: `${repos.length} repositories loaded`,
                    type: "success",
                }),
                error: (error: Error) => ({
                    title: "Sync failed",
                    description: error.message,
                    type: "error",
                }),
            }),
        onSuccess: (repos) => {
            queryClient.setQueryData(REPOS_QUERY_KEY, repos);
        },
    });
}
