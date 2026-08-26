import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorHandler from "./middlewares/ErrorHandler.js"
import notFound from "./middlewares/NotFound.js";
import devErrorTestRouter from "./routes/devErrorTest.routes.js";

import { CORS_ORIGIN, NODE_ENV } from "./constants.js";

if (!CORS_ORIGIN) {
    throw new Error("CORS_ORIGIN is not set");
}

const app = express();

app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());


// Routes import


// Routes declaration

if (NODE_ENV !== "production") {
    app.use("/dev/test-errors", devErrorTestRouter);
}

app.use(notFound);
app.use(errorHandler);

export default app;
