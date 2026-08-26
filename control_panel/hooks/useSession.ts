"use client";

import { useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMe, login, logout, signup, updateSettings } from "@/lib/api";
import { hasCookie } from "@/lib/cookies";

const SESSION_QUERY_KEY = ["session"];

// The cookie never changes without a full page navigation (it's only set/
// cleared by the backend), so there's nothing to subscribe to — this just
// exists to satisfy useSyncExternalStore's signature.
const noopSubscribe = () => () => {};

// accessToken/refreshToken are httpOnly, so the client can't read them
// directly — `hasSession` is a plain marker cookie (same lifetime as the
// access token) set alongside them purely so we know whether it's worth
// asking /me at all. Without this, every anonymous visit to the login page
// would fire a doomed request and log a 401 in the console.
//
// The read itself can't happen directly in the render body: this page is
// server-rendered first (no `document` there, so it'd always read as "not
// present"), then hydrated in the browser (where it reads the real value).
// If those two disagree, React's hydration check fails. useSyncExternalStore
// is built for exactly this — its `getServerSnapshot` is what both the
// server render and the client's first (pre-hydration) render use, so they
// stay identical; only after hydration does it switch to the real value.
//
// The server snapshot returns `null`, not `false` — a real "no cookie" has
// to be distinguishable from "haven't checked the real value yet". A page
// that redirects-if-logged-out (the dashboard) needs to treat the second
// case as still loading, not as a confirmed "not logged in" — otherwise it
// fires that redirect off the transient pre-hydration render, which is
// exactly what was flashing /login on every dashboard reload.
function useHasSessionHint(): boolean | null {
	return useSyncExternalStore(
		noopSubscribe,
		() => hasCookie("hasSession"),
		() => null
	);
}

export function useSession() {
	const hasSessionHint = useHasSessionHint();

	const query = useQuery({
		queryKey: SESSION_QUERY_KEY,
		queryFn: fetchMe,
		enabled: hasSessionHint === true,
	});

	return {
		user: query.data ?? null,
		isLoading: hasSessionHint === null || (hasSessionHint && query.isLoading),
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

export function useSignup() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ email, password }: { email: string; password: string }) => signup(email, password),
		onSuccess: (user) => {
			queryClient.setQueryData(SESSION_QUERY_KEY, user);
		},
	});
}

export function useLogin() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ email, password }: { email: string; password: string }) => login(email, password),
		onSuccess: (user) => {
			queryClient.setQueryData(SESSION_QUERY_KEY, user);
		},
	});
}

export function useUpdateSettings() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateSettings,
		onSuccess: (user) => {
			queryClient.setQueryData(SESSION_QUERY_KEY, user);
		},
	});
}
