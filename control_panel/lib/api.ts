const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
}

export interface SessionUser {
    id: string;
    username: string;
    avatarUrl: string | null;
}

interface ApiResponse<T> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
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
