"use client";

import { useEffect, useState } from "react";
import { projectService, Task } from "@/services/project.service";
import {
  MessageSquare,
  Paperclip,
  Clock,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const COLUMNS = [
  { id: "TODO", label: "To Do", color: "bg-slate-500" },
  { id: "IN_PROGRESS", label: "In Progress", color: "bg-blue-500" },
  { id: "IN_REVIEW", label: "In Review", color: "bg-amber-500" },
  { id: "DONE", label: "Done", color: "bg-green-500" },
];

export function KanbanBoard({
  projectId,
  selectedLabelId,
}: {
  projectId: string;
  selectedLabelId?: string;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await projectService.getTasks(projectId);
        setTasks(data);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [projectId]);

  // Filter tasks locally by label if one is selected
  const displayTasks = selectedLabelId
    ? tasks.filter((t) =>
        t.taskLabels.some((tl) => tl.label.id === selectedLabelId),
      )
    : tasks;

  if (loading)
    return (
      <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest">
        Loading Board...
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
      {COLUMNS.map((col) => (
        <div key={col.id} className="flex flex-col gap-4 min-w-[280px]">
          {/* Column Header */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${col.color}`} />
              <h3 className="font-black text-xs uppercase tracking-widest">
                {col.label}
              </h3>
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-bold">
                {displayTasks.filter((t) => t.status === col.id).length}
              </span>
            </div>
          </div>

          {/* Column Content */}
          <div className="space-y-3 p-2 min-h-[500px] rounded-[2rem] bg-muted/30 border-2 border-dashed border-muted">
            {displayTasks
              .filter((t) => t.status === col.id)
              .map((task) => (
                <div
                  key={task.id}
                  className="bg-card border-2 border-muted hover:border-primary/40 p-5 rounded-[1.5rem] shadow-sm cursor-pointer transition-all group active:scale-95"
                >
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {task.taskLabels.map((tl) => (
                      <div
                        key={tl.label.id}
                        className="h-1.5 w-6 rounded-full"
                        style={{ backgroundColor: tl.label.color }}
                      />
                    ))}
                  </div>

                  <h4 className="font-bold text-sm leading-tight mb-4 group-hover:text-primary transition-colors">
                    {task.title}
                  </h4>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-muted/50">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="flex items-center gap-1 text-[10px] font-bold">
                        <MessageSquare className="w-3 h-3" />{" "}
                        {task._count.comments}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold">
                        <Paperclip className="w-3 h-3" />{" "}
                        {task._count.attachments}
                      </div>
                    </div>

                    {task.assignee && (
                      <Avatar className="h-6 w-6 border-2 border-background ring-1 ring-muted">
                        <AvatarImage src={task.assignee.image} />
                        <AvatarFallback className="text-[8px] font-bold">
                          {task.assignee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
