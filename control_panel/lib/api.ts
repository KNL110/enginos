const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
}

export interface SessionUser {
    id: string;
    username: string;
    avatarUrl: string | null;
    email: string | null;
    hasPassword: boolean;
    githubConnected: boolean;
}

interface ApiResponse<T> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
}

export interface Repo {
    id: string;
    githubRepoId: number;
    owner: string;
    name: string;
    fullName: string;
    description: string | null;
    private: boolean;
    languages: string[] | null;
    defaultBranch: string | null;
    htmlUrl: string;
    githubUpdatedAt: string | null;
}

export const githubLoginUrl = `${API_URL}/api/v1/user/github`;

export async function fetchMe(): Promise<SessionUser | null> {
    const res = await fetch(`${API_URL}/api/v1/user/me`, {
        credentials: "include",
    });

    if (res.status === 401) {
        return null;
    }

    if (!res.ok) {
        throw new Error("Failed to load the current session");
    }

    const body = (await res.json()) as ApiResponse<SessionUser>;
    return body.data;
}

export async function logout(): Promise<void> {
    const res = await fetch(`${API_URL}/api/v1/user/logout`, {
        method: "POST",
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error("Failed to log out");
    }
}

// Sends JSON and parses the JSON body regardless of status, throwing the
// backend's actual error message on failure (e.g. "Invalid email or
// password") instead of a generic one — callers show `err.message` directly.
async function sendJson<T>(method: "POST" | "PATCH", path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const payload = (await res.json().catch(() => null)) as ApiResponse<T> | null;

    if (!res.ok) {
        throw new Error(payload?.message ?? "Something went wrong. Try again.");
    }

    return payload!.data;
}

async function getJson<T>(path: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, { credentials: "include" });

    const payload = (await res.json().catch(() => null)) as ApiResponse<T> | null;

    if (!res.ok) {
        throw new Error(payload?.message ?? "Something went wrong. Try again.");
    }

    return payload!.data;
}

export function signup(email: string, password: string): Promise<SessionUser> {
    return sendJson<SessionUser>("POST", "/api/v1/user/signup", { email, password });
}

export function login(email: string, password: string): Promise<SessionUser> {
    return sendJson<SessionUser>("POST", "/api/v1/user/login", { email, password });
}

export function updateSettings(updates: { username?: string; password?: string }): Promise<SessionUser> {
    return sendJson<SessionUser>("PATCH", "/api/v1/user/settings", updates);
}

export function listRepos(): Promise<Repo[]> {
    return getJson<Repo[]>("/api/v1/repos");
}

export function syncRepos(): Promise<Repo[]> {
    return sendJson<Repo[]>("POST", "/api/v1/repos/sync");
}
