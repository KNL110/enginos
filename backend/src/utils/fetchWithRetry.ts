interface RetryOptions {
    retries?: number;
    retryDelayMs?: number;
}

// Only retries on connection-level failures (thrown by fetch itself -
// timeouts, resets, DNS blips), never on a response that came back with a
// non-ok status - that's a real answer from the server, not a network glitch.
export async function fetchWithRetry(
    input: string | URL,
    init?: RequestInit,
    { retries = 2, retryDelayMs = 500 }: RetryOptions = {}
): Promise<Response> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fetch(input, init);
        } catch (error) {
            lastError = error;
            if (attempt < retries) {
                await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
            }
        }
    }

    throw lastError;
}
