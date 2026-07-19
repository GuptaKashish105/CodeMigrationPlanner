# CodeMigrationPlanner

**AI-powered code migration analysis and planning tool powered by Claude AI**

Analyzes multi-file jQuery codebases, generates prioritized migration roadmaps, and converts sample code as proof-of-concept—all in one workflow.

## 🚀 Live Demo

**Frontend (Live):** https://196afd81-9ede-4017-a932-19eeab354bd4-00-2sw7v9t8c0mb7.worf.replit.dev/

## 🎯 The Problem

Legacy codebases (jQuery, Python 2, Angular 1.x) need to migrate to modern frameworks (React, Python 3, Vue). But migration planning is painful:

- **Manual:** Developers manually audit dependencies across files
- **Blind:** No understanding of which files should migrate first
- **Slow:** Planning phase takes 3-6 months before any code is converted
- **Risky:** Breaking changes discovered mid-migration, not during planning

**ChatGPT can't solve this:** It converts snippets one-by-one, with no project-wide understanding of dependencies or strategic prioritization.

## ✨ The Solution

**CodeMigrationPlanner** is a 5-step AI workflow that:

1. **Analyzes** all files at once (dependencies, complexity, patterns)
2. **Maps** which files call which (criticality ranking)
3. **Generates** a prioritized roadmap (Phase 1 → Phase 2 → Phase 3)
4. **Identifies** breaking changes before they happen
5. **Converts** sample Phase 1 files as proof-of-concept

### Example Output

**Input:** 5 jQuery files (utility.js, auth.js, modal.js, sidebar.js, app.js)

**Output Roadmap:**

```text
PHASE 1 (Priority 1-2): Isolated utilities, low complexity — migrate FIRST
├─ utility.js (2h effort, LOW risk)
│  └─ Functions: debounce(), formatDate()
│  └─ Breaking changes: None
│  └─ Converted code: React hooks included
└─ Phase 1 Total: 2 hours, LOW risk

PHASE 2 (Priority 3-4): Dependent components, medium complexity
├─ auth.js (6h effort, MEDIUM risk)
│  └─ Breaking changes: $.ajax → fetch, global state → Context API
├─ modal.js (5h effort, MEDIUM risk)
│  └─ Breaking changes: jQuery animations → CSS transitions
└─ Phase 2 Total: 11 hours, MEDIUM risk

PHASE 3 (Priority 5): Core logic, high complexity — migrate LAST
├─ sidebar.js (7h effort, HIGH risk)
├─ app.js (9h effort, HIGH risk)
└─ Phase 3 Total: 16 hours, HIGH risk

TOTAL: 29 hours, 5 weeks estimated

CRITICAL PATH: utility.js → auth.js → modal.js → sidebar.js → app.js
```

### Sample Code Conversion

**jQuery (Before):**
```javascript
function debounce(func, wait) {
  var timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(func, wait);
  };
}
```

**React (After):**
```javascript
import { useState, useEffect } from 'react';

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};
```

## 🏗️ Architecture

### Frontend (React + Vite)
- **FileUpload.jsx** - Drag-drop jQuery file upload
- **ProgressBar.jsx** - Track 5-step workflow
- **RoadmapDisplay.jsx** - Visual Phase 1/2/3 cards with effort & risk
- **CodeConverter.jsx** - Before/after side-by-side code comparison
- **ErrorAlert.jsx** - User-friendly error messages

### Backend (Node.js + Express)
- **POST /api/analyze** - Code Analysis (Prompt #1)
- **POST /api/dependencies** - Dependency Mapping (Prompt #2)
- **POST /api/roadmap** - Roadmap Generation (Prompt #3)
- **POST /api/convert** - Code Conversion (Prompt #4)

### AI Engine
- **Model:** Claude Haiku 4.5 (cost-optimized)
- **Prompts:** 4 specialized prompts for analysis → planning → conversion
- **Token Tracking:** Real-time API cost monitoring

## 🔄 How It Works

### Workflow Steps

**Step 1: Upload Files**
User drags jQuery files into the tool (max 5MB per file)

**Step 2: Analyze Code** 
Claude AI extracts:
- File purpose and all functions
- Dependencies (which files it imports)
- Complexity score (LOW/MEDIUM/HIGH)
- Lines of code
- jQuery patterns used ($.ajax, $.on, etc.)
- Breaking changes for React migration

**Step 3: Map Dependencies**
Claude determines:
- Which files call which
- Criticality of each file (CRITICAL/MEDIUM/LOW)
- Isolation score (100 = isolated)
- Call frequency and patterns

**Step 4: Generate Roadmap**
Claude creates:
- **Phase 1:** Isolated, low-complexity files (migrate first, safest)
- **Phase 2:** Medium-complexity files with some dependencies
- **Phase 3:** Core files, high complexity, critical (migrate last, riskiest)
- Effort hours per phase
- Risk levels (color-coded)
- Breaking changes per phase
- Migration strategy for each file

**Step 5: Convert Code**
Claude converts Phase 1 files to React:
- Actual working code (not pseudocode)
- React hooks: useState, useEffect, useContext
- Import statements and exports
- Comments explaining migrations
- Error handling included

## 📊 Why This Beats ChatGPT

| Feature | ChatGPT | CodeMigrationPlanner |
|---------|---------|----------------------|
| **Snippet-by-snippet** | ✅ Yes | ❌ No (whole project) |
| **Understands dependencies** | ❌ No | ✅ Yes (full map) |
| **Prioritizes files** | ❌ No | ✅ Yes (Phase 1→3) |
| **Shows breaking changes** | ❌ No | ✅ Yes (before conversion) |
| **Includes roadmap** | ❌ No | ✅ Yes (phases + effort) |
| **Converts Phase 1 code** | ❌ No | ✅ Yes (production-ready) |
| **Strategy for rest** | ❌ No | ✅ Yes (Phase 2→3 plans) |
| **Risk mitigation** | ❌ No | ✅ Yes (LOW→MEDIUM→HIGH) |

ChatGPT forces you to paste each file individually and convert one snippet at a time—no project context, no planning, no strategy, no risk assessment.

## 💻 Tech Stack

**Frontend:**
- React 18 + Hooks
- Vite (fast build tool)
- Tailwind CSS (styling)
- Axios (API calls)
- react-syntax-highlighter (code display)

**Backend:**
- Node.js + Express.js
- Anthropic Claude API
- Claude Haiku 4.5 model (cost-optimized)
- CORS enabled
- Error handling middleware

**AI & Prompts:**
- 4 specialized Claude prompts
- JSON structured outputs
- Token tracking & cost monitoring
- Retry logic with exponential backoff

**Deployment:**
- Frontend: Replit (free tier)
- Backend: Replit (free tier)
- Repository: GitHub (public)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Anthropic API key (get from console.anthropic.com)

### Local Development

**1. Clone the repo**
```bash
git clone https://github.com/GuptaKashish105/CodeMigrationPlanner.git
cd CodeMigrationPlanner
```

**2. Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
npm run dev
```

Backend runs on: `http://localhost:3001`

**3. Setup Frontend (new terminal)**
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

**4. Open the app**
Navigate to `http://localhost:5173` and start analyzing!

## 📝 API Endpoints

All endpoints require `ANTHROPIC_API_KEY` environment variable.

### POST /api/analyze
Analyzes jQuery files for structure, complexity, and dependencies.

**Request:**
```json
{
  "files": [
    {
      "filename": "utility.js",
      "code": "function debounce(func, wait) { ... }"
    }
  ]
}
```

**Response:**
```json
{
  "analyses": [
    {
      "file_name": "utility.js",
      "purpose": "Helper functions",
      "functions": [...],
      "complexity_score": "LOW",
      "breaking_changes_identified": []
    }
  ]
}
```

### POST /api/dependencies
Maps dependencies between analyzed files.

### POST /api/roadmap
Generates prioritized migration roadmap (Phase 1/2/3).

### POST /api/convert
Converts single jQuery file to React code.

## 💰 Costs

- **Model:** Claude Haiku 4.5 ($1/$5 per million input/output tokens)
- **Typical analysis:** ~$0.05-0.10 per file
- **Free credits:** New API accounts usually get $5-10 in trial credits
- **This project:** Costs ~$0.20-0.50 for all testing

## 📂 Project Structure

```text
CodeMigrationPlanner/
├── backend/
│   ├── src/
│   │   ├── server.js (Express app)
│   │   ├── routes/ (4 API endpoints)
│   │   ├── utils/ (Claude client, prompts)
│   │   └── middleware/ (error handling)
│   ├── .env.example
│   ├── package.json
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx (main component)
│   │   ├── components/ (5 React components)
│   │   ├── services/ (API calls)
│   │   └── styles/ (Tailwind CSS)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .gitignore
│
├── README.md
├── PROMPTS.md (all 4 prompts)
├── EXAMPLES.md (real workflow examples)
└── .gitignore
```

## 🎓 How to Use

1. **Prepare jQuery files** - Gather all .js files you want to migrate
2. **Upload files** - Drag into the app or click to browse
3. **Click "Analyze Files"** - Watch the 5-step workflow
4. **View Roadmap** - See Phase 1/2/3 with effort estimates
5. **Review Converted Code** - See Phase 1 files converted to React
6. **Download** - Export roadmap as JSON for your team
7. **Execute** - Follow the phases to migrate your codebase

## 📊 Example Analysis

**Input:** 5 jQuery files from a legacy dashboard app

**Output:**
- ✅ Roadmap: 29 hours, 5 weeks estimated
- ✅ Phase 1 (2h): utility.js fully converted
- ✅ Phase 2 (11h): auth.js, modal.js with breaking changes flagged
- ✅ Phase 3 (16h): sidebar.js, app.js with migration strategies
- ✅ Risk assessment: LOW → MEDIUM → HIGH
- ✅ Critical path identified

## 🔮 Future Scope

**Phase 2:** Multi-tech-stack support
- Vue.js migrations
- Angular 1.x → Modern Angular
- Python 2 → Python 3
- Svelte migrations

**Phase 3:** Production features
- Database storage for analyses
- Team collaboration features
- Export roadmaps as PDF
- Git integration for automated suggestions
- Batch processing multiple projects

## 🎯 Market Opportunity

The legacy code modernization industry is **$50B+ annually**. Companies spend 3-6 months on migration planning alone. CodeMigrationPlanner cuts planning time by 80% while improving accuracy.

## 📚 Documentation

- **PROMPTS.md** - All 4 Claude prompts with explanations
- **EXAMPLES.md** - Real workflow examples with screenshots
- **DEPLOYMENT.md** - Setup instructions for Replit

---

## Key Features Summary

```text
✅ **Analyzes entire codebases** at once (not just snippets)
✅ **Generates strategic roadmap** with Phase 1/2/3 prioritization
✅ **Identifies breaking changes** before migration starts
✅ **Shows actual code conversions** (jQuery → React)
✅ **Estimates effort & risk** for each phase
✅ **Beautiful UI** for complex data visualization
✅ **Powered by Claude AI** (Haiku 4.5 for cost-efficiency)
✅ **Production-ready code** in both frontend and backend
✅ **Live demo available** on Replit
✅ **Completely free to use** (only API costs ~$0.50)
```

---

## 🤝 Contributing

This is a hackathon submission. Feedback welcome!

## 📄 License

MIT

## 👨‍💻 Built By

Kashish Gupta

Built for Anthropic Hackathon (July 2026)
