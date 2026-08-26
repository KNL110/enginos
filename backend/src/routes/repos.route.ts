import { Router } from "express";
import { getRepos, syncRepos } from "../controllers/repos.js";
import authenticate from "../middlewares/Authenticate.js";

const router = Router();

router.get("/", authenticate, getRepos);
router.post("/sync", authenticate, syncRepos);

export default router;
