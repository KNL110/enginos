import { fetchWithRetry } from "../utils/fetchWithRetry.js";

export const fetchGithubApi = (accessToken: string, path: string): Promise<Response> => {
    return fetchWithRetry(`https://api.github.com${path}`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Accept": "application/vnd.github+json",
            "User-Agent": "DevPilot",
        },
    });
};
