export interface SafeUser {
    id: string;
    username: string;
    avatarUrl: string | null;
    githubUsername: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: SafeUser;
        }
    }
}
