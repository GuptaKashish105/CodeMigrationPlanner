import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.ANTHROPIC_API_KEY) {
  console.error(
    "[FATAL] ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key."
  );
  process.exit(1);
}

// The SDK retries 429/5xx/connection errors automatically with exponential
// backoff — maxRetries: 3 satisfies the "max 3 retries for rate limits"
// requirement without a hand-rolled retry loop.
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 3,
});

const MODEL = "claude-haiku-4-5";
const MAX_TOKENS = 4000;
const TEMPERATURE = 0.7;

// Claude Haiku 4.5 pricing, $ per million tokens.
const PRICING = {
  input: 1.0,
  output: 5.0,
};

function calculateCost(usage) {
  const inputCost = (usage.input_tokens / 1_000_000) * PRICING.input;
  const outputCost = (usage.output_tokens / 1_000_000) * PRICING.output;
  return { inputCost, outputCost, totalCost: inputCost + outputCost };
}

function logUsage(label, usage) {
  const { inputCost, outputCost, totalCost } = calculateCost(usage);
  console.log(
    `[${new Date().toISOString()}] [claude:${label}] ` +
      `input_tokens=${usage.input_tokens} output_tokens=${usage.output_tokens} ` +
      `cost=$${totalCost.toFixed(6)} (in=$${inputCost.toFixed(6)} out=$${outputCost.toFixed(6)})`
  );
}

/**
 * Claude is instructed to return raw JSON/code with no markdown fences, but
 * models occasionally wrap output in ```json ... ``` anyway. Strip that
 * before parsing so a stray fence doesn't turn into a JSON parse error.
 */
function stripMarkdownFences(text) {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:[a-zA-Z]*)\n?([\s\S]*?)\n?```$/);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

/**
 * Sends a single-turn prompt to Claude and returns the cleaned text of the
 * response. Throws on network/API errors (rate limits, overloads, etc. are
 * already retried by the SDK per maxRetries above) and on an empty response.
 */
async function callClaude({ prompt, label = "request" }) {
  let response;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err) {
    throw new Error(`Claude API request failed (${label}): ${err.message}`);
  }

  logUsage(label, response.usage);

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || !textBlock.text) {
    throw new Error(`Claude returned an empty response (${label})`);
  }

  return stripMarkdownFences(textBlock.text);
}

/**
 * Same as callClaude, but parses the response as JSON. Parse failures throw
 * with the raw response attached as `.rawResponse` so the error handler can
 * log it for debugging without leaking it into the client-facing message.
 */
async function callClaudeJSON({ prompt, label = "request" }) {
  const text = await callClaude({ prompt, label });
  try {
    return JSON.parse(text);
  } catch (err) {
    const parseError = new Error(
      `Claude returned invalid JSON for ${label}: ${err.message}`
    );
    parseError.rawResponse = text;
    throw parseError;
  }
}

export { callClaude, callClaudeJSON, MODEL };
