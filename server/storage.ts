import { type Goal, type InsertGoal, type ProgressEntry, type InsertProgressEntry, type JournalEntry, type InsertJournalEntry } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Goals
  getGoals(weekStart: string): Promise<Goal[]>;
  getGoal(id: string): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, updates: Partial<Omit<Goal, 'id'>>): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<boolean>;

  // Progress Entries
  getProgressEntries(): Promise<ProgressEntry[]>;
  getProgressEntry(date: string): Promise<ProgressEntry | undefined>;
  createOrUpdateProgressEntry(entry: InsertProgressEntry): Promise<ProgressEntry>;

  // Journal Entries
  getJournalEntries(): Promise<JournalEntry[]>;
  getJournalEntry(weekStart: string): Promise<JournalEntry | undefined>;
  getJournalEntryById(id: string): Promise<JournalEntry | undefined>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: string, content: string): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private goals: Map<string, Goal>;
  private progressEntries: Map<string, ProgressEntry>;
  private journalEntries: Map<string, JournalEntry>;

  constructor() {
    this.goals = new Map();
    this.progressEntries = new Map();
    this.journalEntries = new Map();
  }

  // Goals
  async getGoals(weekStart: string): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(
      (goal) => goal.weekStart === weekStart
    );
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const goal: Goal = { 
      ...insertGoal, 
      id,
      completed: insertGoal.completed ?? false
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: string, updates: Partial<Omit<Goal, 'id'>>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...updates };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: string): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Progress Entries
  async getProgressEntries(): Promise<ProgressEntry[]> {
    return Array.from(this.progressEntries.values());
  }

  async getProgressEntry(date: string): Promise<ProgressEntry | undefined> {
    return this.progressEntries.get(date);
  }

  async createOrUpdateProgressEntry(insertEntry: InsertProgressEntry): Promise<ProgressEntry> {
    const existing = this.progressEntries.get(insertEntry.date);
    
    if (existing) {
      const updated: ProgressEntry = {
        ...existing,
        goalsCompleted: insertEntry.goalsCompleted,
        totalGoals: insertEntry.totalGoals,
      };
      this.progressEntries.set(insertEntry.date, updated);
      return updated;
    }

    const id = randomUUID();
    const entry: ProgressEntry = { ...insertEntry, id };
    this.progressEntries.set(insertEntry.date, entry);
    return entry;
  }

  // Journal Entries
  async getJournalEntries(): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values());
  }

  async getJournalEntry(weekStart: string): Promise<JournalEntry | undefined> {
    return Array.from(this.journalEntries.values()).find(
      (entry) => entry.weekStart === weekStart
    );
  }

  async getJournalEntryById(id: string): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const id = randomUUID();
    const entry: JournalEntry = { ...insertEntry, id };
    this.journalEntries.set(id, entry);
    return entry;
  }

  async updateJournalEntry(id: string, content: string): Promise<JournalEntry | undefined> {
    const entry = this.journalEntries.get(id);
    if (!entry) return undefined;
    
    const updated: JournalEntry = { ...entry, content };
    this.journalEntries.set(id, updated);
    return updated;
  }

  async deleteJournalEntry(id: string): Promise<boolean> {
    return this.journalEntries.delete(id);
  }
}

export const storage = new MemStorage();
