export interface SafeUser {
    id: string;
    username: string;
    avatarUrl: string | null;
}

declare global {
    namespace Express {
        interface Request {
            user?: SafeUser;
        }
    }
}
