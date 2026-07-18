import { Router } from "express";
import { callClaudeJSON } from "../utils/claudeClient.js";
import { buildDependencyPrompt } from "../utils/prompts.js";
import { ApiError, asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

function validateAnalyses(analyses) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    throw new ApiError(
      'Request body must include a non-empty "analyses" array (output of /api/analyze)',
      400
    );
  }
  analyses.forEach((analysis, index) => {
    if (!analysis || typeof analysis.file_name !== "string") {
      throw new ApiError(`analyses[${index}] is missing "file_name"`, 400);
    }
  });
}

// POST /api/dependencies
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { analyses } = req.body ?? {};
    validateAnalyses(analyses);

    const dependencyMap = await callClaudeJSON({
      prompt: buildDependencyPrompt(analyses),
      label: "dependencies",
    });

    res.json(dependencyMap);
  })
);

export default router;
