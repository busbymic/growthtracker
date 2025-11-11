import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, ChevronDown, ChevronUp, Edit, Trash2, Save } from "lucide-react";
import { getWeekStart, formatWeekStart, formatDate } from "@/lib/utils";
import type { JournalEntry } from "@shared/schema";

export default function ReflectArchive() {
  const { toast } = useToast();
  const currentWeekStart = getWeekStart();
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data: entries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal'],
  });

  const { data: currentEntry } = useQuery<JournalEntry>({
    queryKey: ['/api/journal', currentWeekStart],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { weekStart: string; content: string }) => {
      return await apiRequest("POST", "/api/journal", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      setContent("");
      toast({ description: "Reflection saved successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      return await apiRequest("PATCH", `/api/journal/${id}`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      setEditingId(null);
      setEditContent("");
      toast({ description: "Reflection updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/journal/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      toast({ description: "Reflection deleted" });
    },
  });

  const handleSave = () => {
    if (!content.trim()) {
      toast({
        variant: "destructive",
        description: "Reflection cannot be empty",
      });
      return;
    }

    createMutation.mutate({
      weekStart: currentWeekStart,
      content: content.trim(),
    });
  };

  const handleUpdate = (id: string) => {
    if (!editContent.trim()) {
      toast({
        variant: "destructive",
        description: "Reflection cannot be empty",
      });
      return;
    }

    updateMutation.mutate({ id, content: editContent.trim() });
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
  );

  const getPreview = (text: string) => {
    return text.length > 150 ? text.substring(0, 150) + "..." : text;
  };

  const charCount = content.length;
  const maxChars = 5000;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="text-page-title">
            Reflect & Archive
          </h1>
          <p className="text-sm text-muted-foreground">
            Weekly reflections on your journey
          </p>
        </div>

        {/* Current Week Reflection */}
        {!currentEntry && (
          <Card className="p-6 mb-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground mb-1" data-testid="text-current-week-title">
                This Week's Reflection
              </h2>
              <p className="text-sm text-muted-foreground">{formatWeekStart(currentWeekStart)}</p>
            </div>

            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Reflect on this week's progress, challenges, and insights. What did you learn? What will you do differently next week?"
              className="min-h-[200px] text-base resize-none mb-3"
              maxLength={maxChars}
              data-testid="textarea-new-reflection"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground" data-testid="text-char-count">
                {charCount} / {maxChars} characters
              </span>
              <Button
                onClick={handleSave}
                disabled={!content.trim() || createMutation.isPending}
                data-testid="button-save-reflection"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Reflection
              </Button>
            </div>
          </Card>
        )}

        {/* Archive List */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground" data-testid="text-archive-title">
            Past Reflections
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-24 bg-muted rounded" />
              </Card>
            ))}
          </div>
        ) : sortedEntries.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <BookOpen className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2" data-testid="text-empty-archive-title">
              No reflections yet
            </h3>
            <p className="text-sm text-muted-foreground" data-testid="text-empty-archive-description">
              Start documenting your self-improvement journey by writing your first weekly reflection
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedEntries.map((entry) => {
              const isExpanded = expandedIds.has(entry.id);
              const isEditing = editingId === entry.id;

              return (
                <Card key={entry.id} className="p-6 hover-elevate" data-testid={`card-entry-${entry.id}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-medium text-foreground" data-testid={`text-entry-week-${entry.id}`}>
                        {formatWeekStart(entry.weekStart)}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(entry.weekStart)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isEditing && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(entry.id);
                              setEditContent(entry.content);
                            }}
                            className="h-8 w-8"
                            data-testid={`button-edit-${entry.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(entry.id)}
                            className="h-8 w-8 text-destructive"
                            data-testid={`button-delete-${entry.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <>
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[200px] text-sm resize-none mb-3"
                        maxLength={maxChars}
                        data-testid={`textarea-edit-${entry.id}`}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {editContent.length} / {maxChars}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingId(null);
                              setEditContent("");
                            }}
                            data-testid={`button-cancel-edit-${entry.id}`}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdate(entry.id)}
                            disabled={updateMutation.isPending}
                            data-testid={`button-save-edit-${entry.id}`}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-foreground mb-3 whitespace-pre-wrap" data-testid={`text-entry-content-${entry.id}`}>
                        {isExpanded ? entry.content : getPreview(entry.content)}
                      </div>
                      {entry.content.length > 150 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(entry.id)}
                          className="text-primary -ml-2"
                          data-testid={`button-toggle-expand-${entry.id}`}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-1" />
                              Show less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" />
                              Read more
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
