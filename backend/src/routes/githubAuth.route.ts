import { Router } from "express";
import {
    githubAuthorize,
    githubCallback,
    refreshAccessToken,
    logoutUser,
    getCurrentUser,
} from "../controllers/githubAuth.js";
import authenticate from "../middlewares/Authenticate.js";

const router = Router();

router.get("/github", githubAuthorize);
router.get("/github/callback", githubCallback);
router.post("/refresh-token", refreshAccessToken);

//secured routes
router.post("/logout", authenticate, logoutUser);
router.get("/me", authenticate, getCurrentUser);

export default router;