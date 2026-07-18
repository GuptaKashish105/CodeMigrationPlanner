import axios from "axios";

const API_BASE = "http://localhost:3001/api";

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 120_000,
});

/**
 * Normalizes axios/network/backend errors into a single readable message.
 * The backend always responds with { error, status: "error" } on failure
 * (see backend/src/middleware/errorHandler.js) — surface that message
 * verbatim when present.
 */
function extractErrorMessage(error) {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.code === "ECONNABORTED") {
    return "The request timed out. Claude may be taking longer than usual — try again.";
  }
  if (error.request) {
    return "Could not reach the backend at http://localhost:3001. Is the server running?";
  }
  return error.message || "An unexpected error occurred.";
}

async function readFilesAsPayload(files) {
  return Promise.all(
    files.map(async (file) => ({
      filename: file.name,
      code: await file.text(),
    }))
  );
}

/**
 * @param {File[]} files - raw File objects from a file input / drop event
 * @returns {Promise<{analyses: object[], status: string}>}
 */
export async function analyzeFiles(files) {
  try {
    const payload = await readFilesAsPayload(files);
    const { data } = await client.post("/analyze", { files: payload });
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

/**
 * @param {object[]} analyses - output of analyzeFiles().analyses
 * @returns {Promise<{dependencies: object[], call_graph: object, critical_files: string[], isolated_files: string[]}>}
 */
export async function getDependencies(analyses) {
  try {
    const { data } = await client.post("/dependencies", { analyses });
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

/**
 * @param {object[]} analyses
 * @param {object} dependencyMap - output of getDependencies()
 * @returns {Promise<{phases: object[], breaking_changes_by_phase: object, total_effort_hours: number, estimated_duration_weeks: number, critical_path: string[]}>}
 */
export async function getRoadmap(analyses, dependencyMap) {
  try {
    const { data } = await client.post("/roadmap", { analyses, dependencyMap });
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

/**
 * @param {string} filename
 * @param {string} code
 * @returns {Promise<{filename: string, targetFramework: string, convertedCode: string, migrationNotes: string}>}
 */
export async function convertCode(filename, code) {
  try {
    const { data } = await client.post("/convert", {
      filename,
      code,
      targetFramework: "react",
    });
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}
