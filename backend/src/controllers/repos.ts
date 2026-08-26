import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { listReposForUser, syncReposForUser } from "../services/repos.service.js";

export const getRepos = asyncHandler(async (req, res) => {
    const repos = await listReposForUser(req.user!.id);
    return res.json(new ApiResponse(200, repos, "Repositories fetched successfully"));
});

export const syncRepos = asyncHandler(async (req, res) => {
    if (!req.user!.githubConnected) {
        throw new ApiError(400, "Connect GitHub to sync repositories");
    }

    const repos = await syncReposForUser(req.user!.id);
    return res.json(new ApiResponse(200, repos, "Repositories synced successfully"));
});
