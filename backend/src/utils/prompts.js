/**
 * PROMPT_1 — Code Analysis
 */
function buildAnalyzePrompt(filename, code) {
  return `You are a code migration specialist. Analyze the following jQuery/JavaScript file and extract structured information.
Return ONLY valid JSON (no markdown, no code blocks, pure JSON). Do not add any preamble or explanation.
For the file provided, extract:

file_name: (inferred from context or "unknown")
purpose: (1-2 sentence summary of what this file does)
functions: (array of all function names and their purpose)
lines_of_code: (approximate count)
dependencies: (array of external files or libraries it imports/uses)
jquery_patterns: (array of jQuery patterns used: ".ajax", ".on", "$(selector)", etc.)
complexity_score: ("LOW", "MEDIUM", or "HIGH")
complexity_reason: (why you assigned this score)
breaking_changes_identified: (array of issues that will break during migration to React)

JSON format (strict):
{
"file_name": "string",
"purpose": "string",
"functions": [{"name": "string", "purpose": "string"}],
"lines_of_code": number,
"dependencies": ["string"],
"jquery_patterns": ["string"],
"complexity_score": "LOW|MEDIUM|HIGH",
"complexity_reason": "string",
"breaking_changes_identified": ["string"]
}
FILE TO ANALYZE:
Filename: ${filename}

${code}`;
}

/**
 * PROMPT_2 — Dependency Mapping
 */
function buildDependencyPrompt(analyses) {
  return `You are a code dependency analyzer. Given the following file analyses, create a dependency map showing which files call which.
Return ONLY valid JSON (no markdown).
For each file in the input, determine:

is_called_by: (which other files call this one)
calls_files: (which other files this one calls, based on dependencies field)
call_frequency: (LOW: <5 calls, MEDIUM: 5-20 calls, HIGH: >20 calls)
criticality: (CRITICAL if many files depend on it, MEDIUM if some do, LOW if isolated)
isolation_score: (number 0-100, 100 = completely isolated)

JSON format (strict):
{
"dependencies": [
{
"file_name": "string",
"is_called_by": ["string"],
"calls_files": ["string"],
"call_frequency": "LOW|MEDIUM|HIGH",
"criticality": "CRITICAL|MEDIUM|LOW",
"isolation_score": number
}
],
"call_graph": {"file_name": ["file_names_it_calls"]},
"critical_files": ["string"],
"isolated_files": ["string"]
}
ANALYSES TO MAP:
${JSON.stringify(analyses, null, 2)}`;
}

/**
 * PROMPT_3 — Roadmap Generation
 */
function buildRoadmapPrompt(analyses, dependencyMap) {
  return `You are a migration planning expert. Given file analyses and dependency data, create a prioritized migration roadmap.
Phase 1: Files with LOW complexity AND HIGH isolation (migrate first, lowest risk)
Phase 2: Files with MEDIUM complexity OR MEDIUM criticality (migrate second)
Phase 3: Files with HIGH complexity OR CRITICAL criticality (migrate last, highest risk)
Return ONLY valid JSON (no markdown).
JSON format (strict):
{
"phases": [
{
"phase": number,
"title": "string",
"files": [
{
"file_name": "string",
"reason": "string",
"effort_hours": number,
"risk_level": "LOW|MEDIUM|HIGH",
"dependencies_satisfied": ["string"],
"migration_strategy": "string"
}
],
"total_effort_hours": number,
"total_risk": "LOW|MEDIUM|HIGH"
}
],
"breaking_changes_by_phase": {
"phase_1": ["string"],
"phase_2": ["string"],
"phase_3": ["string"]
},
"total_effort_hours": number,
"estimated_duration_weeks": number,
"critical_path": ["file_name"]
}
ANALYSES:
${JSON.stringify(analyses, null, 2)}
DEPENDENCY MAP:
${JSON.stringify(dependencyMap, null, 2)}`;
}

/**
 * PROMPT_4 — Code Conversion
 */
function buildConvertPrompt(filename, code) {
  return `Convert the following jQuery/JavaScript file to modern React best practices.
Return ONLY the React code (no explanations, no markdown, no code blocks).
Include:

Import statements at top
Hooks (useState, useEffect, useContext, useCallback as needed)
Comments explaining each migration
Proper error handling
Export statements at bottom
JSDoc comments for functions

CODE TO CONVERT:
Filename: ${filename}

${code}`;
}

export {
  buildAnalyzePrompt,
  buildDependencyPrompt,
  buildRoadmapPrompt,
  buildConvertPrompt,
};
