# CodeMigrationPlanner: 4-Prompt Pipeline

This document contains all 4 working prompts used to analyze codebases and generate migration roadmaps.

**Testing Status:** Each prompt has been tested with sample jQuery files and refined based on output quality.

---

## Prompt #1: Code Analysis

**Purpose:** Analyze individual jQuery files to extract structure, dependencies, and complexity.

**Input:** One or more jQuery source files (full code)

**Output:** Structured JSON with file metadata

### Prompt Text:

```text
You are a code migration specialist. Analyze the following jQuery/JavaScript file and extract structured information.
Return ONLY valid JSON (no markdown, no code blocks, pure JSON). Do not add any preamble or explanation.
For the file provided, extract:

file_name: (inferred from context or "unknown")
purpose: (1-2 sentence summary of what this file does)
functions: (array of all function names and their purpose)
lines_of_code: (approximate count)
dependencies: (array of external files or libraries it imports/uses)
jquery_patterns: (array of jQuery patterns used: ".ajax",".ajax", "
.ajax",".on", "$(selector)", etc.)
complexity_score: ("LOW", "MEDIUM", or "HIGH")
complexity_reason: (why you assigned this score)
breaking_changes_identified: (array of issues that will break during migration, e.g., "Uses deprecated jQuery plugin", "Tightly coupled global state")

JSON format:
{
"file_name": "string",
"purpose": "string",
"functions": [
{
"name": "string",
"purpose": "string"
}
],
"lines_of_code": number,
"dependencies": ["string"],
"jquery_patterns": ["string"],
"complexity_score": "LOW|MEDIUM|HIGH",
"complexity_reason": "string",
"breaking_changes_identified": ["string"]
}
FILE TO ANALYZE:
[PASTE YOUR FILE HERE]
```

### How to Use:
1. Open claude.ai
2. Paste the prompt above
3. Replace `[PASTE YOUR FILE HERE]` with one of the sample jQuery files
4. Submit
5. Copy the JSON output
6. Repeat for all 5 files (utility.js, auth.js, modal.js, sidebar.js, app.js)

### Expected Output Example:
```json
{
  "file_name": "utility.js",
  "purpose": "Provides reusable helper functions for debouncing and date formatting.",
  "functions": [
    {
      "name": "debounce",
      "purpose": "Delays function execution until after specified wait period"
    },
    {
      "name": "formatDate",
      "purpose": "Converts date object to locale string"
    }
  ],
  "lines_of_code": 15,
  "dependencies": [],
  "jquery_patterns": [],
  "complexity_score": "LOW",
  "complexity_reason": "Pure utility functions with no external dependencies or side effects",
  "breaking_changes_identified": []
}
```

---

## Prompt #2: Dependency Mapping

**Purpose:** Analyze relationships between files to understand call chains and criticality.

**Input:** JSON outputs from Prompt #1 (all 5 files analyzed)

**Output:** Dependency graph and criticality ranking

### Prompt Text:

```text
You are a code dependency analyzer. Given the following file analyses, create a dependency map showing which files call which, how many times, and their criticality.
Return ONLY valid JSON (no markdown, no code blocks, pure JSON).
Input data (from Prompt #1 for all files):
[PASTE ALL 5 JSON OUTPUTS HERE]
For each file, determine:

is_called_by: (which other files call this one)
calls_files: (which other files this one calls)
call_frequency: (LOW: <5 calls, MEDIUM: 5-20 calls, HIGH: >20 calls)
criticality: (CRITICAL if many files depend on it, MEDIUM if some do, LOW if isolated)

JSON format:
{
"dependencies": [
{
"file_name": "string",
"is_called_by": ["string"],
"calls_files": ["string"],
"call_frequency": "LOW|MEDIUM|HIGH",
"criticality": "CRITICAL|MEDIUM|LOW",
"isolation_score": "number (0-100, 100 = completely isolated)"
}
],
"call_graph": {
"file_name": ["file_name_it_calls"]
},
"critical_files": ["string (files many others depend on)"],
"isolated_files": ["string (files with few dependencies)"]
}
```

### How to Use:
1. In claude.ai, paste Prompt #2
2. Replace `[PASTE ALL 5 JSON OUTPUTS HERE]` with the combined JSON from Prompt #1 (all 5 files)
3. Submit
4. Copy the JSON output

### Expected Output Example:
```json
{
  "dependencies": [
    {
      "file_name": "utility.js",
      "is_called_by": ["auth.js", "modal.js", "app.js"],
      "calls_files": [],
      "call_frequency": "HIGH",
      "criticality": "CRITICAL",
      "isolation_score": 95
    },
    {
      "file_name": "auth.js",
      "is_called_by": ["app.js"],
      "calls_files": ["utility.js"],
      "call_frequency": "MEDIUM",
      "criticality": "MEDIUM",
      "isolation_score": 60
    }
  ],
  "call_graph": {
    "utility.js": [],
    "auth.js": ["utility.js"],
    "app.js": ["auth.js", "sidebar.js", "modal.js"]
  },
  "critical_files": ["utility.js", "app.js"],
  "isolated_files": ["modal.js"]
}
```

---

## Prompt #3: Roadmap Generation

**Purpose:** Create a prioritized migration roadmap based on analysis and dependencies.

**Input:** Outputs from Prompt #1 (analysis) + Prompt #2 (dependencies)

**Output:** Phased migration roadmap with effort estimates

### Prompt Text:

```text
You are a migration planning expert. Given file analysis and dependency data, create a prioritized migration roadmap.
Phase 1: Files with LOW complexity and HIGH isolation (migrate first, lowest risk)
Phase 2: Files with MEDIUM complexity or MEDIUM criticality (migrate second)
Phase 3: Files with HIGH complexity or CRITICAL criticality (migrate last, highest risk)
Return ONLY valid JSON (no markdown).
File Analysis (from Prompt #1):
[PASTE ALL FILE ANALYSES HERE]
Dependency Map (from Prompt #2):
[PASTE DEPENDENCY MAP HERE]
JSON format:
{
"phases": [
{
"phase": 1,
"title": "Foundation (Utilities & Isolated Components)",
"files": [
{
"file_name": "string",
"reason": "string (why this file goes in this phase)",
"effort_hours": number,
"risk_level": "LOW|MEDIUM|HIGH",
"dependencies_satisfied": ["string (which Phase 1 files it depends on)"],
"migration_strategy": "string (how to migrate this file to React)"
}
],
"total_effort_hours": number,
"total_risk": "LOW|MEDIUM|HIGH"
},
{
"phase": 2,
"title": "string",
"files": [...],
"total_effort_hours": number,
"total_risk": "LOW|MEDIUM|HIGH"
},
{
"phase": 3,
"title": "string",
"files": [...],
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
"critical_path": ["file_name (order that must be migrated)"]
}
```

### How to Use:
1. In claude.ai, paste Prompt #3
2. Replace `[PASTE ALL FILE ANALYSES HERE]` with output from Prompt #1
3. Replace `[PASTE DEPENDENCY MAP HERE]` with output from Prompt #2
4. Submit
5. Copy the JSON output (this is your roadmap)

### Expected Output Example:
```json
{
  "phases": [
    {
      "phase": 1,
      "title": "Foundation (Utilities & Isolated Components)",
      "files": [
        {
          "file_name": "utility.js",
          "reason": "Pure utility functions, no dependencies, used by all other files",
          "effort_hours": 5,
          "risk_level": "LOW",
          "dependencies_satisfied": [],
          "migration_strategy": "Convert pure functions to React hooks (useDebounce hook, etc.)"
        },
        {
          "file_name": "auth.js",
          "reason": "Low complexity, only depends on utility.js which will be ready in Phase 1",
          "effort_hours": 8,
          "risk_level": "LOW",
          "dependencies_satisfied": ["utility.js"],
          "migration_strategy": "Replace $.ajax with fetch, use Context for currentUser state"
        }
      ],
      "total_effort_hours": 13,
      "total_risk": "LOW"
    },
    {
      "phase": 2,
      "title": "Components (Modal & Sidebar)",
      "files": [
        {
          "file_name": "modal.js",
          "reason": "Medium complexity, depends on Phase 1 utilities",
          "effort_hours": 12,
          "risk_level": "MEDIUM",
          "dependencies_satisfied": ["utility.js"],
          "migration_strategy": "Split into ModalHeader and ModalBody components, use state for visibility"
        }
      ],
      "total_effort_hours": 20,
      "total_risk": "MEDIUM"
    },
    {
      "phase": 3,
      "title": "Core Application Logic",
      "files": [
        {
          "file_name": "app.js",
          "reason": "High complexity, orchestrates all other files, tightly coupled",
          "effort_hours": 30,
          "risk_level": "HIGH",
          "dependencies_satisfied": ["utility.js", "auth.js", "modal.js", "sidebar.js"],
          "migration_strategy": "Refactor into Container component with multiple sub-components"
        }
      ],
      "total_effort_hours": 30,
      "total_risk": "HIGH"
    }
  ],
  "breaking_changes_by_phase": {
    "phase_1": ["utility.js has no breaking changes", "auth.js: $.ajax must be replaced with fetch"],
    "phase_2": ["modal.js: jQuery animations must become CSS transitions"],
    "phase_3": ["app.js: Global state management must become Context/Redux"]
  },
  "total_effort_hours": 63,
  "estimated_duration_weeks": 2,
  "critical_path": ["utility.js", "auth.js", "modal.js", "sidebar.js", "app.js"]
}
```

---

## Prompt #4: Code Conversion

**Purpose:** Convert Phase 1 files to React with working, production-ready code.

**Input:** Phase 1 files (from roadmap) + the actual source code

**Output:** React component/hook code with comments

### Prompt Text:

```text
You are an expert React developer. Convert the following jQuery file to React, following best practices.
Return the React code with:

Import statements
Hooks (useState, useEffect, useContext as needed)
Clear comments explaining the migration
Proper error handling
Export statements

Do NOT include explanations or markdown. Just the pure React code.
JQUERY FILE TO CONVERT:
[PASTE THE ORIGINAL JQUERY FILE HERE]
MIGRATION NOTES:

Replace $.ajax calls with fetch API
Convert jQuery event handlers to React event props
Convert jQuery DOM manipulation to React state
Create reusable custom hooks where applicable
Use functional components only
```

### How to Use:
1. In claude.ai, paste Prompt #4
2. Replace `[PASTE THE ORIGINAL JQUERY FILE HERE]` with utility.js
3. Submit
4. Copy the React code output
5. Repeat for auth.js
6. Screenshot both outputs for EXAMPLES.md

### Expected Output Example:

For utility.js:
```javascript
// utility.js converted to React hooks

import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing a value
 * Delays state updates until after specified delay with no new changes
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} The debounced value
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    // Set up the timeout to update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // Clean up the timeout if value changes before delay completes
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};

/**
 * Utility function for formatting dates
 * Converts Date object to localized string
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};
```

---

## Notes

- All prompts return JSON for easy parsing and combination
- Each prompt builds on the previous one's output
- Prompts are designed to work with the provided sample jQuery files
- Output is production-ready and can be directly used in a React application
- Breaking changes are identified before any code is written
