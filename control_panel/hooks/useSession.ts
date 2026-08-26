"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMe, logout } from "@/lib/api";
import { hasCookie } from "@/lib/cookies";

const SESSION_QUERY_KEY = ["session"];

export function useSession() {
	// accessToken/refreshToken are httpOnly, so the client can't read them
	// directly — `hasSession` is a plain marker cookie (same lifetime as the
	// access token) set alongside them purely so we know whether it's worth
	// asking /me at all. Without this, every anonymous visit to the login
	// page would fire a doomed request and log a 401 in the console.
	const query = useQuery({
		queryKey: SESSION_QUERY_KEY,
		queryFn: fetchMe,
		enabled: hasCookie("hasSession"),
	});

	return {
		user: query.data ?? null,
		isLoading: query.isLoading,
	};
}

export function useLogout() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: logout,
		onSuccess: () => {
			queryClient.setQueryData(SESSION_QUERY_KEY, null);
		},
	});
}
