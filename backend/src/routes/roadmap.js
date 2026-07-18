import { Router } from "express";
import { callClaudeJSON } from "../utils/claudeClient.js";
import { buildRoadmapPrompt } from "../utils/prompts.js";
import { ApiError, asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

function validateInput(analyses, dependencyMap) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    throw new ApiError(
      'Request body must include a non-empty "analyses" array (output of /api/analyze)',
      400
    );
  }
  if (
    !dependencyMap ||
    typeof dependencyMap !== "object" ||
    !Array.isArray(dependencyMap.dependencies)
  ) {
    throw new ApiError(
      'Request body must include "dependencyMap" (output of /api/dependencies)',
      400
    );
  }
}

// POST /api/roadmap
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { analyses, dependencyMap } = req.body ?? {};
    validateInput(analyses, dependencyMap);

    const roadmap = await callClaudeJSON({
      prompt: buildRoadmapPrompt(analyses, dependencyMap),
      label: "roadmap",
    });

    res.json(roadmap);
  })
);

export default router;
