import { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncHandler = (handle: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler => {
    return (req, res, next) => {
        Promise.resolve(handle(req, res, next)).catch((err) => next(err));
    }
}
