# CodeMigrationPlanner

**Intelligent code migration analysis and planning tool powered by Claude AI**

Analyzes multi-file codebases, generates prioritized migration roadmaps, and converts sample code as proof-of-concept—all in one workflow.

---

## 🚀 Live Demo

**Frontend:** https://196afd81-9ede-4017-a932-19eeab354bd4-00-2sw7v9t8c0mb7.worf.replit.dev/

---

## The Problem

Legacy codebases (jQuery, Python 2, Angular 1.x) need to migrate to modern frameworks (React, Python 3, Vue). But migration planning is painful:

- **Manual:** Developers manually audit dependencies across files
- **Blind:** No understanding of which files should migrate first
- **Slow:** Planning phase takes 3–6 months before any code is converted
- **Risky:** Breaking changes discovered mid-migration, not during planning

**Traditional AI chat tools aren't designed for this workflow:** They typically convert snippets one-by-one, without project-wide dependency analysis or strategic migration planning.

---

# The Solution

**CodeMigrationPlanner** is a 4-step AI pipeline that:

1. **Analyzes** all files at once (dependencies, complexity, patterns)
2. **Maps** which files call which (criticality ranking)
3. **Generates** a prioritized roadmap (Phase 1 → Phase 2 → Phase 3)
4. **Converts** sample Phase 1 files as proof-of-concept

## Output Example

```text
PHASE 1 (Priority 1–2): Isolated utilities, low complexity — migrate FIRST
├── utility.js → ✅ CONVERTED TO REACT (with code)
├── auth.js → ✅ CONVERTED TO REACT (with code)
└── Effort: 20 hours | Risk: LOW

PHASE 2 (Priority 3–4): Dependent modules, medium complexity
├── modal.js → Strategy: Split into 2 components
├── sidebar.js → Strategy: Replace globals with useContext
└── Effort: 40 hours | Risk: MEDIUM

PHASE 3 (Priority 5): Core application logic — migrate LAST
├── app.js → Strategy: Refactor into Container + Presentational components
└── Effort: 80 hours | Risk: HIGH

BREAKING CHANGES IDENTIFIED
⚠ utility.js depends on deprecated jQuery plugin (no direct React equivalent)
⚠ auth.js is tightly coupled to app.js through global variables
```

---

# How It Works

## Step 1 — Code Analysis

Upload your legacy files and the AI extracts:

- File purpose
- Functions
- Dependencies
- Complexity score
- Lines of code
- Legacy framework patterns

---

## Step 2 — Dependency Mapping

The analysis is combined to determine:

- Which files call which
- Dependency graph
- Critical files
- Isolated modules
- Shared utilities

---

## Step 3 — Migration Roadmap

Based on complexity and dependencies, the AI generates:

### Phase 1
- Low-risk
- Low-complexity
- Independent files

### Phase 2
- Medium complexity
- Moderate dependencies
- Refactoring recommendations

### Phase 3
- Core application
- High-risk components
- Final migration sequence

Each phase includes:

- Estimated effort
- Risk level
- Breaking changes
- Migration strategy

---

## Step 4 — Proof-of-Concept Conversion

Phase 1 files are converted into production-style React code with:

- Functional components
- Hooks (`useState`, `useEffect`, `useContext`)
- Imports
- Comments explaining migration decisions
- Testing recommendations

---

# Why CodeMigrationPlanner?

| Capability | Traditional AI Chat | CodeMigrationPlanner |
|------------|---------------------|----------------------|
| Converts individual snippets | ✅ | ❌ |
| Understands entire project | ❌ | ✅ |
| Dependency analysis | ❌ | ✅ |
| Prioritized migration phases | ❌ | ✅ |
| Detects breaking changes | ❌ | ✅ |
| Migration roadmap | ❌ | ✅ |
| Converts initial production-ready files | ❌ | ✅ |
| Strategy for remaining codebase | ❌ | ✅ |

Instead of treating every file independently, CodeMigrationPlanner understands the complete codebase before recommending a migration strategy.

---

# Tech Stack

- **AI Engine:** Claude AI
- **Language:** JavaScript / Node.js
- **Output:** JSON reports + React code
- **Deployment:** Replit (Free Tier)

---

# Getting Started

## Prerequisites

- Claude (Web or API)
- Legacy codebase (recommended 5–10 files)

---

## Usage

1. Collect your legacy project files.
2. Run **Prompt #1** to analyze the codebase.
3. Run **Prompt #2** to generate the dependency map.
4. Run **Prompt #3** to create the migration roadmap.
5. Run **Prompt #4** to convert the Phase 1 files.

See **PROMPTS.md** for complete prompts.

See **EXAMPLES.md** for sample inputs and outputs.

---

# Prompt Pipeline

The project is driven by four carefully designed prompts.

## Prompt 1 — Code Analysis

Extracts:

- File structure
- Functions
- Dependencies
- Complexity

---

## Prompt 2 — Dependency Mapping

Produces:

- Dependency graph
- File relationships
- Criticality ranking

---

## Prompt 3 — Roadmap Generation

Produces:

- Migration phases
- Effort estimates
- Risk analysis
- Breaking changes

---

## Prompt 4 — Code Conversion

Generates:

- React components
- Hooks
- Imports
- Migration comments
- Testing considerations

---

See **PROMPTS.md** for the complete prompt collection.

---

# Examples

## Example Input

```
utility.js
auth.js
modal.js
sidebar.js
app.js
```

---

## Example Output

```
Phase 1
- utility.js
- auth.js

Phase 2
- modal.js
- sidebar.js

Phase 3
- app.js
```

Complete examples are available in **EXAMPLES.md**.

---

# Sample Migration

## Before (jQuery)

```javascript
function debounce(func, wait) {
  var timeout;

  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(func, wait);
  };
}
```

## After (React)

```javascript
import { useEffect, useState } from "react";

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

---

# Future Roadmap

## Current MVP

- jQuery → React

---

## Phase 2

Support additional migrations:

- Vue.js
- AngularJS → Angular
- Python 2 → Python 3
- API modernization
- Microservice migration

---

## Phase 3

Production platform features:

- Claude API integration
- Project database
- PDF export
- JSON export
- Team collaboration
- Dashboard

---

# Market Opportunity

Legacy software modernization represents a **$50B+** annual industry.

Large organizations often spend **3–6 months** planning migrations before writing production code.

CodeMigrationPlanner aims to reduce planning time by **up to 80%** while providing dependency-aware migration strategies.

---

# Project Structure

```text
CodeMigrationPlanner/
│
├── README.md
├── PROMPTS.md
├── EXAMPLES.md
│
└── demo/
    └── index.html
```

---

## License

This project is intended as an AI-assisted migration planning demonstration and proof of concept.
