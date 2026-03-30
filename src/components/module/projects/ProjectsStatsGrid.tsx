"use client";

import { ProjectStats } from "@/services/project.service";
import {
  CircleDot,
  Timer,
  SearchCode,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  stats: ProjectStats;
}

export function ProjectStatsGrid({ stats }: Props) {
  // Calculate completion percentage safely
  const completionRate =
    stats.total > 0
      ? Math.round(((stats.done + stats.canceled) / stats.total) * 100)
      : 0;

  const statusItems = [
    {
      label: "To Do",
      count: stats.todo,
      color: "text-slate-500",
      bg: "bg-slate-500/10",
      icon: CircleDot,
    },
    {
      label: "In Progress",
      count: stats.inProgress,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      icon: Timer,
    },
    {
      label: "In Review",
      count: stats.inReview,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      icon: SearchCode,
    },
    {
      label: "Done",
      count: stats.done,
      color: "text-green-500",
      bg: "bg-green-500/10",
      icon: CheckCircle2,
    },
    {
      label: "Canceled",
      count: stats.canceled,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      icon: XCircle,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Overall Progress Header */}
      <div className="bg-card border rounded-[2rem] p-8 shadow-sm overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative h-32 w-32 flex items-center justify-center">
            {/* Progress Ring logic would go here, using a simple display for now */}
            <div className="text-center">
              <span className="text-4xl font-black">{completionRate}%</span>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Complete
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div className="flex justify-between items-end">
              <h3 className="font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Project Velocity
              </h3>
              <span className="text-xs font-medium text-muted-foreground">
                {stats.done} of {stats.total} tasks resolved
              </span>
            </div>
            <Progress value={completionRate} className="h-3 rounded-full" />
            <p className="text-xs text-muted-foreground italic">
              *Includes canceled tasks as resolved items.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Granular Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statusItems.map((item) => (
          <div
            key={item.label}
            className="bg-card border rounded-2xl p-4 flex flex-col items-center gap-2 text-center group hover:border-primary/20 transition-all"
          >
            <div className={`${item.bg} p-2 rounded-xl`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-xl font-black">{item.count}</p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
