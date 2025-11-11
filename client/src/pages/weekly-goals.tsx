import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, GripVertical, Trash2, Target, X } from "lucide-react";
import { getWeekStart, formatWeekStart } from "@/lib/utils";
import type { Goal } from "@shared/schema";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableGoalCardProps {
  goal: Goal;
  onUpdate: (id: string, title: string) => void;
  onToggleComplete: (goal: Goal) => void;
  onDelete: (id: string) => void;
  editingGoals: { [key: string]: string };
  setEditingGoals: (goals: { [key: string]: string }) => void;
}

function SortableGoalCard({ goal, onUpdate, onToggleComplete, onDelete, editingGoals, setEditingGoals }: SortableGoalCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-6 hover-elevate" data-testid={`card-goal-${goal.id}`}>
      <div className="flex items-start gap-4">
        {/* Priority Badge & Drag Handle */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold" data-testid={`badge-priority-${goal.priority}`}>
            {goal.priority}
          </div>
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        {/* Goal Content */}
        <div className="flex-1 min-w-0">
          {editingGoals[goal.id] !== undefined ? (
            <Textarea
              value={editingGoals[goal.id]}
              onChange={(e) => setEditingGoals({ ...editingGoals, [goal.id]: e.target.value })}
              onBlur={() => onUpdate(goal.id, editingGoals[goal.id])}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  onUpdate(goal.id, editingGoals[goal.id]);
                }
              }}
              className="min-h-[80px] text-base resize-none"
              placeholder="Enter your goal..."
              autoFocus
              data-testid={`input-goal-${goal.id}`}
            />
          ) : (
            <div
              onClick={() => setEditingGoals({ ...editingGoals, [goal.id]: goal.title })}
              className={`min-h-[80px] p-3 rounded-md cursor-text text-base ${
                goal.title ? "text-foreground" : "text-muted-foreground"
              } ${goal.completed ? "line-through opacity-60" : ""}`}
              data-testid={`text-goal-${goal.id}`}
            >
              {goal.title || "Click to add goal..."}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          <Checkbox
            checked={goal.completed}
            onCheckedChange={() => onToggleComplete(goal)}
            className="h-5 w-5"
            data-testid={`checkbox-complete-${goal.id}`}
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(goal.id)}
            className="h-8 w-8 text-destructive"
            data-testid={`button-delete-${goal.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function WeeklyGoals() {
  const { toast } = useToast();
  const weekStart = getWeekStart();
  const [editingGoals, setEditingGoals] = useState<{ [key: string]: string }>({});
  const [draftGoal, setDraftGoal] = useState<string>("");
  const [showDraftInput, setShowDraftInput] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ['/api/goals', weekStart],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; priority: number }) => {
      return await apiRequest("POST", "/api/goals", {
        ...data,
        weekStart,
        completed: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals', weekStart] });
      setDraftGoal("");
      setShowDraftInput(false);
      toast({ description: "Goal added successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, title, completed, priority }: { id: string; title?: string; completed?: boolean; priority?: number }) => {
      return await apiRequest("PATCH", `/api/goals/${id}`, { title, completed, priority });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals', weekStart] });
      setEditingGoals({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals', weekStart] });
      toast({ description: "Goal removed" });
    },
  });

  const handleStartAddGoal = () => {
    if (goals.length >= 3) {
      toast({
        variant: "destructive",
        description: "Maximum 3 goals per week",
      });
      return;
    }
    setShowDraftInput(true);
  };

  const handleSaveDraft = () => {
    if (!draftGoal.trim()) {
      toast({
        variant: "destructive",
        description: "Goal cannot be empty",
      });
      return;
    }

    const existingPriorities = goals.map(g => g.priority);
    const nextPriority = [1, 2, 3].find(p => !existingPriorities.includes(p)) || goals.length + 1;

    createMutation.mutate({
      title: draftGoal.trim(),
      priority: nextPriority,
    });
  };

  const handleCancelDraft = () => {
    setDraftGoal("");
    setShowDraftInput(false);
  };

  const handleUpdateGoal = (id: string, title: string) => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        description: "Goal cannot be empty",
      });
      return;
    }
    updateMutation.mutate({ id, title: title.trim() });
  };

  const handleToggleComplete = (goal: Goal) => {
    updateMutation.mutate({ id: goal.id, completed: !goal.completed });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedGoals.findIndex((g) => g.id === active.id);
      const newIndex = sortedGoals.findIndex((g) => g.id === over.id);

      const reorderedGoals = arrayMove(sortedGoals, oldIndex, newIndex);

      // Update priorities for all affected goals
      reorderedGoals.forEach((goal, index) => {
        const newPriority = index + 1;
        if (goal.priority !== newPriority) {
          updateMutation.mutate({ id: goal.id, priority: newPriority });
        }
      });
    }
  };

  const sortedGoals = [...goals].sort((a, b) => a.priority - b.priority);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="text-page-title">
            Weekly Goals
          </h1>
          <p className="text-sm text-muted-foreground" data-testid="text-week-start">
            {formatWeekStart(weekStart)}
          </p>
        </div>

        {/* Goals List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-20 bg-muted rounded" />
              </Card>
            ))}
          </div>
        ) : sortedGoals.length === 0 && !showDraftInput ? (
          <Card className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <Target className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2" data-testid="text-empty-state-title">
              No goals set yet
            </h3>
            <p className="text-sm text-muted-foreground mb-6" data-testid="text-empty-state-description">
              Start your week strong by setting up to 3 focused goals
            </p>
            <Button onClick={handleStartAddGoal} data-testid="button-add-first-goal">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Goal
            </Button>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedGoals.map(g => g.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {sortedGoals.map((goal) => (
                  <SortableGoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdate={handleUpdateGoal}
                    onToggleComplete={handleToggleComplete}
                    onDelete={deleteMutation.mutate}
                    editingGoals={editingGoals}
                    setEditingGoals={setEditingGoals}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Draft Goal Input */}
        {showDraftInput && (
          <Card className="p-6 mt-4 border-primary">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">
                  {goals.length + 1}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <Textarea
                  value={draftGoal}
                  onChange={(e) => setDraftGoal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleSaveDraft();
                    } else if (e.key === 'Escape') {
                      handleCancelDraft();
                    }
                  }}
                  className="min-h-[80px] text-base resize-none"
                  placeholder="Enter your new goal... (Ctrl+Enter to save, Esc to cancel)"
                  autoFocus
                  data-testid="textarea-draft-goal"
                />
              </div>

              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={createMutation.isPending || !draftGoal.trim()}
                  data-testid="button-save-draft"
                >
                  Save
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCancelDraft}
                  className="h-8 w-8"
                  data-testid="button-cancel-draft"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Add Goal Button */}
        {sortedGoals.length > 0 && sortedGoals.length < 3 && !showDraftInput && (
          <Button
            onClick={handleStartAddGoal}
            variant="outline"
            className="w-full mt-6"
            data-testid="button-add-goal"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goal ({3 - sortedGoals.length} remaining)
          </Button>
        )}

        {/* Completion Summary */}
        {sortedGoals.length > 0 && (
          <Card className="mt-8 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week's Progress</p>
                <p className="text-2xl font-semibold text-foreground mt-1" data-testid="text-completion-count">
                  {sortedGoals.filter(g => g.completed).length} / {sortedGoals.length}
                </p>
              </div>
              <div className="h-16 w-16 rounded-full border-4 border-primary flex items-center justify-center">
                <span className="text-lg font-semibold text-primary" data-testid="text-completion-percentage">
                  {Math.round((sortedGoals.filter(g => g.completed).length / sortedGoals.length) * 100)}%
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
