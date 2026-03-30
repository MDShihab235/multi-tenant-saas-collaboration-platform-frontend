"use client";

import { ActivityLog } from "@/services/activity.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PlusCircle,
  RefreshCcw,
  Trash2,
  UserPlus,
  MessageSquare,
  History,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

// Mapping backend slugs to tactical UI elements
const ACTION_CONFIG: Record<
  string,
  { label: string; icon: any; color: string; bg: string }
> = {
  created_task: {
    label: "Task Initialized",
    icon: PlusCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  updated_task: {
    label: "Intel Modified",
    icon: RefreshCcw,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  deleted_task: {
    label: "Data Purged",
    icon: Trash2,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  member_joined: {
    label: "New Deployment",
    icon: UserPlus,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  comment_added: {
    label: "Field Report",
    icon: MessageSquare,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
};

interface ActivityItemProps {
  log: ActivityLog;
  className?: string;
}

export function ActivityItem({ log, className }: ActivityItemProps) {
  const config = ACTION_CONFIG[log.action] || {
    label: "General Event",
    icon: History,
    color: "text-muted-foreground",
    bg: "bg-muted/20",
  };

  const Icon = config.icon;

  return (
    <div
      className={cn(
        "group flex flex-col sm:flex-row sm:items-center gap-6 p-6 rounded-[2.5rem] bg-card border-2 border-muted hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.99]",
        className,
      )}
    >
      {/* 1. ACTOR SECTION */}
      <div className="flex items-center gap-4 min-w-[200px]">
        <div className="relative">
          <Avatar className="h-12 w-12 border-2 border-background shadow-sm group-hover:scale-110 transition-transform duration-300">
            <AvatarImage src={log.actor.image} alt={log.actor.name} />
            <AvatarFallback className="font-black bg-primary/10 text-primary uppercase">
              {log.actor.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {/* Small status indicator or action icon overlay */}
          <div
            className={cn(
              "absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-background flex items-center justify-center",
              config.bg,
            )}
          >
            <Icon className={cn("w-2.5 h-2.5", config.color)} />
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-black uppercase tracking-tight text-foreground/90">
            {log.actor.name}
          </span>
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
            {formatDistanceToNow(new Date(log.createdAt))} ago
          </span>
        </div>
      </div>

      {/* 2. ICON DESKTOP VIEW */}
      <div
        className={cn(
          "hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 transition-colors",
          config.bg,
        )}
      >
        <Icon className={cn("w-5 h-5", config.color)} />
      </div>

      {/* 3. CONTENT SECTION */}
      <div className="flex-1 space-y-1 min-w-0">
        <p
          className={cn(
            "text-[10px] font-black uppercase tracking-[0.2em]",
            config.color,
          )}
        >
          {config.label}
        </p>
        <h4 className="text-lg font-bold tracking-tight text-foreground truncate max-w-[90%]">
          {log.entityName}
        </h4>
      </div>

      {/* 4. ACTION / INDICATOR */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
            Inspect
          </span>
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
