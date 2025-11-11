import type { Express } from "express";
import http from "http";
import { randomUUID } from "crypto";

type Goal = { id: string; title: string; dueDate?: string; completed?: boolean };
type Reflection = { id: string; date: string; notes: string };

const goals: Record<string, Goal> = {};
const reflections: Record<string, Reflection> = {};

export async function registerRoutes(app: Express) {
  // health check
  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // ---- Goals ----
  app.get("/api/goals", (_req, res) => res.json(Object.values(goals)));

  // Create goal (auto-fill today's date if none provided)
  app.post("/api/goals", (req, res) => {
    const { title, dueDate } = req.body ?? {};
    if (!title) return res.status(400).json({ message: "title is required" });

    const id = randomUUID();
    const autoDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const goal: Goal = {
      id,
      title,
      dueDate: dueDate || autoDate,
      completed: false,
    };

    goals[id] = goal;
    res.status(201).json(goal);
  });

  app.patch("/api/goals/:id", (req, res) => {
    const goal = goals[req.params.id];
    if (!goal) return res.status(404).json({ message: "not found" });

    const { title, dueDate, completed } = req.body ?? {};
    if (title !== undefined) goal.title = title;
    if (dueDate !== undefined) goal.dueDate = dueDate;
    if (completed !== undefined) goal.completed = !!completed;

    res.json(goal);
  });

  app.delete("/api/goals/:id", (req, res) => {
    if (!goals[req.params.id]) return res.status(404).json({ message: "not found" });
    delete goals[req.params.id];
    res.status(204).end();
  });

  // ---- Reflections ----
  app.get("/api/reflections", (_req, res) => res.json(Object.values(reflections)));

  app.post("/api/reflections", (req, res) => {
    const { date, notes } = req.body ?? {};
    if (!date || !notes) return res.status(400).json({ message: "date and notes required" });

    const id = randomUUID();
    const entry: Reflection = { id, date, notes };
    reflections[id] = entry;
    res.status(201).json(entry);
  });

  app.delete("/api/reflections/:id", (req, res) => {
    if (!reflections[req.params.id]) return res.status(404).json({ message: "not found" });
    delete reflections[req.params.id];
    res.status(204).end();
  });

  // Return the HTTP server instance
  const server = http.createServer(app);
  return server;
}
