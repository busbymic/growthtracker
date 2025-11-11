import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Award, Calendar as CalendarIcon } from "lucide-react";
import { getLast30Days, isToday, getDayName, getWeekStart } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ProgressEntry, Goal } from "@shared/schema";

export default function ProgressTracker() {
  const { toast } = useToast();
  const last30Days = getLast30Days();
  const todayDate = new Date().toISOString().split('T')[0];
  const weekStart = getWeekStart();

  const { data: progressData = [] } = useQuery<ProgressEntry[]>({
    queryKey: ['/api/progress'],
  });

  const { data: todayGoals = [] } = useQuery<Goal[]>({
    queryKey: ['/api/goals', weekStart],
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (data: { date: string; goalsCompleted: number; totalGoals: number }) => {
      return await apiRequest("POST", "/api/progress", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
      toast({ description: "Progress updated" });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      return await apiRequest("PATCH", `/api/goals/${id}`, { completed });
    },
    onSuccess: async (_, variables) => {
      // First, refetch goals to get fresh data
      await queryClient.invalidateQueries({ queryKey: ['/api/goals', weekStart] });
      const freshGoals = await queryClient.fetchQuery<Goal[]>({
        queryKey: ['/api/goals', weekStart],
      });
      
      // Calculate completion count from fresh data
      const completedCount = freshGoals.filter(g => g.completed).length;
      
      // Update progress entry for today with accurate counts
      updateProgressMutation.mutate({
        date: todayDate,
        goalsCompleted: completedCount,
        totalGoals: freshGoals.length,
      });
    },
  });

  // Calculate statistics
  const completedDays = progressData.filter(p => p.goalsCompleted === p.totalGoals && p.totalGoals > 0).length;
  const totalDaysWithGoals = progressData.filter(p => p.totalGoals > 0).length;
  const completionRate = totalDaysWithGoals > 0 ? Math.round((completedDays / totalDaysWithGoals) * 100) : 0;

  // Calculate current streak
  const calculateStreak = () => {
    let streak = 0;
    const sortedProgress = [...progressData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (const entry of sortedProgress) {
      if (entry.goalsCompleted === entry.totalGoals && entry.totalGoals > 0) {
        streak++;
      } else if (entry.totalGoals > 0) {
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  const getProgressForDate = (date: string) => {
    return progressData.find(p => p.date === date);
  };

  const getCompletionLevel = (progress: ProgressEntry | undefined) => {
    if (!progress || progress.totalGoals === 0) return 'none';
    const ratio = progress.goalsCompleted / progress.totalGoals;
    if (ratio === 1) return 'complete';
    if (ratio >= 0.5) return 'partial';
    return 'minimal';
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="text-page-title">
            Progress Tracker
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your goal completion journey
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground" data-testid="text-current-streak">
                {currentStreak}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Day Streak
              </p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <Award className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground" data-testid="text-total-completed">
                {completedDays}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Days Done
              </p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <CalendarIcon className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground" data-testid="text-completion-rate">
                {completionRate}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Success Rate
              </p>
            </div>
          </Card>
        </div>

        {/* Today's Quick Check-in */}
        {todayGoals.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4" data-testid="text-today-checkin-title">
              Today's Check-in
            </h2>
            <div className="space-y-3">
              {todayGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center gap-3 p-3 rounded-md hover-elevate"
                  data-testid={`checkin-goal-${goal.id}`}
                >
                  <Checkbox
                    checked={goal.completed}
                    onCheckedChange={(checked) => 
                      updateGoalMutation.mutate({ id: goal.id, completed: !!checked })
                    }
                    className="h-5 w-5"
                    data-testid={`checkbox-today-goal-${goal.id}`}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                      {goal.priority}
                    </div>
                    <span className={cn(
                      "text-sm",
                      goal.completed ? "line-through text-muted-foreground" : "text-foreground"
                    )} data-testid={`text-today-goal-${goal.id}`}>
                      {goal.title || "Untitled goal"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Progress Today</span>
                <span className="text-sm font-medium text-foreground" data-testid="text-today-progress">
                  {todayGoals.filter(g => g.completed).length} / {todayGoals.length} completed
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* 30-Day Calendar Grid */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6" data-testid="text-calendar-title">
            Last 30 Days
          </h2>
          
          <div className="grid grid-cols-7 gap-2">
            {last30Days.map((date) => {
              const progress = getProgressForDate(date);
              const level = getCompletionLevel(progress);
              const isTodayDate = isToday(date);
              
              return (
                <div
                  key={date}
                  className={cn(
                    "aspect-square rounded-md flex flex-col items-center justify-center gap-1 text-xs transition-all",
                    level === 'complete' && "bg-primary text-primary-foreground",
                    level === 'partial' && "bg-primary/50 text-foreground",
                    level === 'minimal' && "bg-primary/20 text-foreground",
                    level === 'none' && "border border-border text-muted-foreground",
                    isTodayDate && "ring-2 ring-primary ring-offset-2"
                  )}
                  data-testid={`calendar-day-${date}`}
                >
                  <span className="font-medium">{getDayName(date)}</span>
                  <span className="text-[10px] opacity-80">
                    {new Date(date).getDate()}
                  </span>
                  {progress && progress.totalGoals > 0 && (
                    <span className="text-[10px] font-semibold" data-testid={`day-completion-${date}`}>
                      {progress.goalsCompleted}/{progress.totalGoals}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">Legend</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-primary rounded" />
                <span className="text-xs text-muted-foreground">All completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-primary/50 rounded" />
                <span className="text-xs text-muted-foreground">Partially done</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border border-border rounded" />
                <span className="text-xs text-muted-foreground">No goals</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
