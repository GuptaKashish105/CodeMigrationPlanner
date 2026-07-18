import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import analyzeRouter from "./routes/analyze.js";
import dependenciesRouter from "./routes/dependencies.js";
import roadmapRouter from "./routes/roadmap.js";
import convertRouter from "./routes/convert.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "50mb" }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/analyze", analyzeRouter);
app.use("/api/dependencies", dependenciesRouter);
app.use("/api/roadmap", roadmapRouter);
app.use("/api/convert", convertRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] CodeMigrationPlanner backend listening on port ${PORT}`);
});
