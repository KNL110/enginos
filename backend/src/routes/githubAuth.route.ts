import { Router } from "express";
import { githubAuthorize,githubCallback } from "../controllers/githubAuth.js";

const router = Router();

router.get("/github", githubAuthorize);
router.get("/github/callback", githubCallback);

export default router;