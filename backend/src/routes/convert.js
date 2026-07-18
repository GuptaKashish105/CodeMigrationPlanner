import { Router } from "express";
import { callClaude } from "../utils/claudeClient.js";
import { buildConvertPrompt } from "../utils/prompts.js";
import { ApiError, asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

// Guards against pathological inputs that would blow past max_tokens on the
// way out (the model can only produce ~4000 output tokens per request).
const MAX_CODE_LENGTH = 200_000;

function validateInput({ filename, code, targetFramework }) {
  if (typeof filename !== "string" || !filename.trim()) {
    throw new ApiError('Request body must include a "filename" string', 400);
  }
  if (typeof code !== "string" || !code.trim()) {
    throw new ApiError('Request body must include non-empty "code"', 400);
  }
  if (code.length > MAX_CODE_LENGTH) {
    throw new ApiError(
      `File is too large to convert in one request (${code.length} chars, max ${MAX_CODE_LENGTH}). Split it into smaller files first.`,
      400
    );
  }
  if (targetFramework !== undefined && targetFramework !== "react") {
    throw new ApiError('Unsupported "targetFramework" — only "react" is currently supported', 400);
  }
}

// POST /api/convert
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { filename, code } = req.body ?? {};
    const targetFramework = req.body?.targetFramework ?? "react";
    validateInput({ filename, code, targetFramework });

    const convertedCode = await callClaude({
      prompt: buildConvertPrompt(filename, code),
      label: `convert:${filename}`,
    });

    res.json({
      filename,
      targetFramework,
      convertedCode,
      migrationNotes:
        "Migration decisions and jQuery-to-React equivalents are documented as inline comments within convertedCode.",
    });
  })
);

export default router;
