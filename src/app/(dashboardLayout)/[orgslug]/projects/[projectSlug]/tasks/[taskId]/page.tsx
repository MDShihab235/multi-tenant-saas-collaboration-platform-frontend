"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { projectService } from "@/services/project.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeft,
  Trash2,
  Calendar,
  User as UserIcon,
  MessageSquare,
  Loader2,
  AlertTriangle,
  Clock,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { orgSlug, projectSlug, taskId } = params as {
    orgSlug: string;
    projectSlug: string;
    taskId: string;
  };

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await projectService.getTaskById(projectSlug, taskId);
        setTask(data);
      } catch (err) {
        toast.error("Task not found or has been removed.");
        router.push(`/${orgSlug}/projects/${projectSlug}/tasks`);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [projectSlug, taskId, orgSlug, router]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await projectService.deleteTask(projectSlug, taskId);
      toast.success("Task permanently deleted.");

      // Redirect to the project task board/list
      router.push(`/${orgSlug}/projects/${projectSlug}/tasks`);
      router.refresh();
    } catch (err) {
      toast.error("Failed to delete task. Please try again.");
      setIsDeleting(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between border-b pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="-ml-2 text-muted-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to project
        </Button>

        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete Task
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Permanently delete task?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>
                    This will permanently remove <strong>{task.title}</strong>{" "}
                    and all related data:
                  </p>
                  <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                    <li>All comments and discussion history.</li>
                    <li>All file attachments and shared links.</li>
                    <li>All assigned labels and sub-tasks.</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  className="bg-destructive text-white hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Confirm Permanent Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* MAIN CONTENT: Title, Description, Comments */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <Badge
              variant="secondary"
              className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-mono"
            >
              Task-{taskId.slice(0, 4)}
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight">
              {task.title}
            </h1>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
              {task.description || "No description provided for this task."}
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" /> Discussion
            </h3>
            {/* Comment Section Placeholder */}
            <div className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground text-sm">
              <p>Activity feed coming soon...</p>
            </div>
          </div>
        </div>

        {/* SIDEBAR: Metadata & Stats */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest block mb-3">
                Status
              </label>
              <Badge className="bg-primary hover:bg-primary border-none px-4 py-1 capitalize">
                {task.status.toLowerCase().replace("_", " ")}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-2">
                  <UserIcon className="h-3.5 w-3.5" /> Assignee
                </span>
                <span className="text-sm font-semibold">
                  {task.assignee?.name || "Unassigned"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" /> Priority
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {task.priority || "Normal"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" /> Created
                </span>
                <span className="text-xs font-mono">
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest block mb-3">
                Labels
              </label>
              <div className="flex flex-wrap gap-2">
                {task.labels?.map((label: any) => (
                  <Badge
                    key={label.id}
                    style={{ backgroundColor: label.color, color: "#fff" }}
                    className="border-none text-[10px]"
                  >
                    {label.name}
                  </Badge>
                ))}
                {(!task.labels || task.labels.length === 0) && (
                  <span className="text-xs italic text-muted-foreground">
                    No labels
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/40 rounded-lg border border-dashed flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Tag className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-foreground">Audit Log</p>
              <p className="text-muted-foreground">Last updated 2 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
