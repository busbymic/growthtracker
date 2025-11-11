import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Weekly Goals Table
export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  priority: integer("priority").notNull(), // 1, 2, or 3
  weekStart: date("week_start").notNull(), // Monday of the week
  completed: boolean("completed").notNull().default(false),
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
}).extend({
  title: z.string().min(1, "Goal cannot be empty").max(200, "Goal is too long"),
  priority: z.number().min(1).max(3),
  weekStart: z.string(),
  completed: z.boolean().optional(),
});

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

// Progress Tracking Table (daily completion records)
export const progressEntries = pgTable("progress_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: date("date").notNull().unique(),
  goalsCompleted: integer("goals_completed").notNull().default(0),
  totalGoals: integer("total_goals").notNull().default(3),
});

export const insertProgressEntrySchema = createInsertSchema(progressEntries).omit({
  id: true,
}).extend({
  date: z.string(),
  goalsCompleted: z.number().min(0).max(3),
  totalGoals: z.number().min(1).max(3),
});

export type InsertProgressEntry = z.infer<typeof insertProgressEntrySchema>;
export type ProgressEntry = typeof progressEntries.$inferSelect;

// Journal Reflections Table
export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weekStart: date("week_start").notNull().unique(),
  content: text("content").notNull(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
}).extend({
  weekStart: z.string(),
  content: z.string().min(1, "Journal entry cannot be empty").max(5000, "Entry is too long"),
});

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
