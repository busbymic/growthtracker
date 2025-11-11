import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// ESM dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// serve built Vite app from dist/public
const publicDir = path.resolve(__dirname, "../public");
app.use(express.static(publicDir));
app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

const port = parseInt(process.env.PORT || "5000", 10);
app.listen(port, "0.0.0.0", () => {
  console.log(`Serving on port ${port}`);
});
