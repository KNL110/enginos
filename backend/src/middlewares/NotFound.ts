import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

const notFound = (req: Request, _res: Response, next: NextFunction) => {
    next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export default notFound;
