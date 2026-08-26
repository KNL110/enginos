class ApiError extends Error {
    statusCode: number;
    data: null;
    success: false;
    errors: Array<{ field?: string; message: string }>;
    isOperational: boolean;

    constructor(
        statusCode: number,
        message = "Something went wrong",
        errors: Array<{ field?: string; message: string }> = [],
        isOperational = true,
        stack = ""
    ) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.errors = errors;
        this.isOperational = isOperational;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }

        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

export { ApiError };
