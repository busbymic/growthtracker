import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGoalSchema, insertProgressEntrySchema, insertJournalEntrySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Goals endpoints
  app.get("/api/goals/:weekStart", async (req, res) => {
    try {
      const { weekStart } = req.params;
      const goals = await storage.getGoals(weekStart);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create goal" });
      }
    }
  });

  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title, completed, priority } = req.body;
      
      const updates: Partial<{ title: string; completed: boolean; priority: number }> = {};
      if (title !== undefined) updates.title = title;
      if (completed !== undefined) updates.completed = completed;
      if (priority !== undefined) updates.priority = priority;

      const goal = await storage.updateGoal(id, updates);
      
      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }
      
      res.json(goal);
    } catch (error) {
      res.status(500).json({ error: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteGoal(id);
      
      if (!success) {
        return res.status(404).json({ error: "Goal not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete goal" });
    }
  });

  // Progress endpoints
  app.get("/api/progress", async (req, res) => {
    try {
      const entries = await storage.getProgressEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch progress entries" });
    }
  });

  app.post("/api/progress", async (req, res) => {
    try {
      const validatedData = insertProgressEntrySchema.parse(req.body);
      const entry = await storage.createOrUpdateProgressEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create progress entry" });
      }
    }
  });

  // Journal endpoints
  app.get("/api/journal", async (req, res) => {
    try {
      const entries = await storage.getJournalEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });

  app.get("/api/journal/:weekStart", async (req, res) => {
    try {
      const { weekStart } = req.params;
      const entry = await storage.getJournalEntry(weekStart);
      
      if (!entry) {
        return res.status(404).json({ error: "Journal entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journal entry" });
    }
  });

  app.post("/api/journal", async (req, res) => {
    try {
      const validatedData = insertJournalEntrySchema.parse(req.body);
      
      // Check if entry already exists for this week
      const existing = await storage.getJournalEntry(validatedData.weekStart);
      if (existing) {
        return res.status(400).json({ error: "Journal entry already exists for this week" });
      }
      
      const entry = await storage.createJournalEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create journal entry" });
      }
    }
  });

  app.patch("/api/journal/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: "Content is required" });
      }

      const entry = await storage.updateJournalEntry(id, content);
      
      if (!entry) {
        return res.status(404).json({ error: "Journal entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to update journal entry" });
    }
  });

  app.delete("/api/journal/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteJournalEntry(id);
      
      if (!success) {
        return res.status(404).json({ error: "Journal entry not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete journal entry" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
