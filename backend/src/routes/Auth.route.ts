import { Router } from "express";
import {
    githubAuthorize,
    githubCallback,
    refreshAccessToken,
    logoutUser,
    getCurrentUser,
} from "../controllers/githubAuth.js";
import {
    signupWithPassword,
    loginWithPassword,
    updateSettings,
} from "../controllers/passwordAuth.js";
import authenticate from "../middlewares/Authenticate.js";

const router = Router();

router.get("/github", githubAuthorize);
router.get("/github/callback", githubCallback);
router.post("/refresh-token", refreshAccessToken);
router.post("/signup", signupWithPassword);
router.post("/login", loginWithPassword);

//secured routes
router.post("/logout", authenticate, logoutUser);
router.get("/me", authenticate, getCurrentUser);
router.patch("/settings", authenticate, updateSettings);

export default router;