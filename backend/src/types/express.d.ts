export interface SafeUser {
    id: string;
    username: string;
    avatarUrl: string | null;
    email: string | null;
    hasPassword: boolean;
    githubConnected: boolean;
}

declare global {
    namespace Express {
        interface Request {
            user?: SafeUser;
        }
    }
}
