"use client";

import { useEffect, useState, useCallback } from "react";
import { projectService, ProjectLabel } from "@/services/project.service";
import { Tag, Plus, Loader2, Hash, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Internal Component
import { CreateLabelModal } from "./CreateLabelModal";

interface Props {
  projectId: string;
  onSelect?: (labelId: string) => void;
  selectedLabelId?: string;
}

export function ProjectLabels({ projectId, onSelect, selectedLabelId }: Props) {
  const [labels, setLabels] = useState<ProjectLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchLabels = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectService.getLabels(projectId);
      // Sort A-Z as per requirements
      const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
      setLabels(sorted);
    } catch (err: any) {
      toast.error("Labels Error", { description: err.message });
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  if (loading && labels.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2">
        <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Syncing Labels...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Icon Indicator */}
      <div className="flex items-center gap-2 mr-1 text-muted-foreground/60">
        <Tag className="w-3.5 h-3.5" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
          Labels
        </span>
      </div>

      {/* Label List */}
      <div className="flex flex-wrap gap-2">
        {labels.map((label) => {
          const isActive = selectedLabelId === label.id;
          return (
            <button
              key={label.id}
              onClick={() => onSelect?.(label.id)}
              className={`
                group flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all duration-200
                ${
                  isActive
                    ? "bg-primary border-primary text-primary-foreground shadow-md scale-105"
                    : "bg-background hover:border-primary/30 border-muted text-foreground"
                }
              `}
            >
              <div
                className="w-2 h-2 rounded-full shadow-inner"
                style={{ backgroundColor: label.color }}
              />
              <span className="text-xs font-bold tracking-tight">
                {label.name}
              </span>

              {/* Task Count Badge */}
              <span
                className={`
                text-[9px] font-black px-1.5 py-0.5 rounded-md border transition-colors
                ${
                  isActive
                    ? "bg-white/20 border-white/20 text-white"
                    : "bg-muted border-muted-foreground/10 text-muted-foreground"
                }
              `}
              >
                {label._count?.taskLabels || 0}
              </span>

              {isActive && (
                <Check className="w-3 h-3 ml-0.5 animate-in zoom-in-50" />
              )}
            </button>
          );
        })}

        {/* Create Action */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-xl h-8 px-4 border-dashed border-2 hover:bg-primary/5 hover:border-primary/50 transition-all font-bold text-[11px] uppercase tracking-tighter"
        >
          <Plus className="w-3 h-3 mr-1.5 text-primary" />
          New Label
        </Button>
      </div>

      {/* Create Label Modal Component */}
      <CreateLabelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={projectId}
        onSuccess={fetchLabels} // Triggers re-fetch to show new label instantly
      />
    </div>
  );
}
