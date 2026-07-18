import { Router } from "express";
import { callClaudeJSON } from "../utils/claudeClient.js";
import { buildAnalyzePrompt } from "../utils/prompts.js";
import { ApiError, asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

function validateFiles(files) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new ApiError('Request body must include a non-empty "files" array', 400);
  }
  files.forEach((file, index) => {
    if (!file || typeof file.filename !== "string" || !file.filename.trim()) {
      throw new ApiError(`files[${index}] is missing a valid "filename"`, 400);
    }
    if (typeof file.code !== "string" || !file.code.trim()) {
      throw new ApiError(`files[${index}] ("${file.filename}") is missing "code"`, 400);
    }
  });
}

// POST /api/analyze
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { files } = req.body ?? {};
    validateFiles(files);

    const analyses = await Promise.all(
      files.map((file) =>
        callClaudeJSON({
          prompt: buildAnalyzePrompt(file.filename, file.code),
          label: `analyze:${file.filename}`,
        })
      )
    );

    res.json({ analyses, status: "success" });
  })
);

export default router;
