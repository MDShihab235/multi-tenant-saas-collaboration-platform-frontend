"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  projectService,
  TaskDetail,
  ProjectMember,
  TaskStatus,
  TaskComment,
  TaskAttachment,
  TaskLabel,
} from "@/services/project.service";
import {
  ArrowLeft,
  Check,
  Loader2,
  ChevronDown,
  Search,
  ShieldCheck,
  MessageSquare,
  Plus,
  UserPlus,
  X,
  Send,
  Edit3,
  Trash2,
  Paperclip,
  FileIcon,
  UploadCloud,
  Download,
  Flag,
  Tag as TagIcon,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  TODO: { label: "To Do", color: "bg-slate-500" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-600" },
  IN_REVIEW: { label: "In Review", color: "bg-amber-500" },
  DONE: { label: "Completed", color: "bg-emerald-600" },
  CANCELED: { label: "Canceled", color: "bg-rose-500" },
};

// Auth Context Mock (Replace with your actual Auth Provider)
const CURRENT_USER_ID = "me";
const CURRENT_USER_ROLE = "OWNER";

export default function TaskDetailPage() {
  const { orgSlug, projectId, taskId } = useParams();
  const router = useRouter();

  // Refs
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [availableLabels, setAvailableLabels] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // --- 1. DATA INITIALIZATION ---
  const fetchAllData = useCallback(async () => {
    try {
      const [tData, mData, cData, aData, lData] = await Promise.all([
        projectService.getTaskDetail(projectId as string, taskId as string),
        projectService.getProjectMembers(projectId as string),
        projectService.getTaskComments(taskId as string),
        projectService.getTaskAttachments(taskId as string),
        projectService.getTaskLabels(taskId as string),
      ]);
      setTask(tData);
      setMembers(mData);
      setComments(cData);
      setAttachments(aData);
      setAvailableLabels(lData);
      setTitleInput(tData.title);
    } catch {
      router.push(`/${orgSlug}/projects/${projectId}`);
    } finally {
      setLoading(false);
    }
  }, [projectId, taskId, orgSlug, router]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- 2. OPTIMISTIC UPDATES ---
  const handleMutation = async (
    action: () => Promise<any>,
    optimistic: Partial<TaskDetail>,
    msg: string,
  ) => {
    if (!task) return;
    const backup = { ...task };
    setTask((prev) => (prev ? { ...prev, ...optimistic } : null));
    setIsMutating(true);
    try {
      await action();
      toast.success(msg);
    } catch {
      setTask(backup);
      toast.error("Transmission Interrupted");
    } finally {
      setIsMutating(false);
    }
  };

  // --- 3. LABEL MANAGEMENT (RELATIONAL) ---
  const handleAssignLabel = async (labelId: string, labelData: any) => {
    if (!task || task.taskLabels.some((tl) => tl.label.id === labelId)) return;
    const backup = [...task.taskLabels];
    const optimisticLabel: TaskLabel = {
      id: "syncing",
      taskId: taskId as string,
      labelId,
      label: labelData,
    };
    setTask((prev) =>
      prev
        ? { ...prev, taskLabels: [...prev.taskLabels, optimisticLabel] }
        : null,
    );
    try {
      await projectService.assignLabel(taskId as string, labelId);
      const fresh = await projectService.getTaskLabels(taskId as string); // Sync clean state
      setTask((prev) => (prev ? { ...prev, taskLabels: fresh } : null));
    } catch {
      setTask((prev) => (prev ? { ...prev, taskLabels: backup } : null));
    }
  };

  const handleRemoveLabel = async (labelId: string) => {
    if (!task) return;
    const backup = [...task.taskLabels];
    setTask((prev) =>
      prev
        ? {
            ...prev,
            taskLabels: prev.taskLabels.filter((tl) => tl.label.id !== labelId),
          }
        : null,
    );
    try {
      await projectService.removeLabel(taskId as string, labelId);
    } catch {
      setTask((prev) => (prev ? { ...prev, taskLabels: backup } : null));
    }
  };

  // --- 4. ASSET MANAGEMENT (SECURE) ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await projectService.uploadTaskAttachment(taskId as string, file);
      const fresh = await projectService.getTaskAttachments(taskId as string);
      setAttachments(fresh);
      toast.success("Asset Encrypted & Deployed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSecureDownload = async (id: string, name: string) => {
    setIsProcessingId(id);
    try {
      const asset = await projectService.getAttachmentDetail(
        taskId as string,
        id,
      );
      const link = document.createElement("a");
      link.href = asset.url; // Signed URL from server
      link.setAttribute("download", name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsProcessingId(null);
    }
  };

  // --- 5. COMMENT THREADING ---
  const handlePostComment = async () => {
    if (!commentInput.trim() || isSubmittingComment) return;
    const msg = commentInput;
    setCommentInput("");
    setIsSubmittingComment(true);
    try {
      const res = await projectService.addComment(taskId as string, msg);
      setComments((prev) => [...prev, res]);
      setTimeout(
        () => scrollEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch {
      setCommentInput(msg);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center font-black animate-pulse">
        Establishing Mission Link...
      </div>
    );
  if (!task) return null;

  return (
    <div className="max-w-[1400px] mx-auto p-6 md:p-12 space-y-12 animate-in fade-in duration-500">
      {/* HEADER NAVIGATION */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="rounded-2xl font-black text-xs uppercase tracking-widest group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />{" "}
          Board
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        {/* LEFT: MISSION PARAMETERS */}
        <div className="lg:col-span-8 space-y-16">
          <div className="space-y-8">
            <div className="flex flex-wrap gap-3 items-center">
              <Badge
                className={`rounded-xl px-4 py-1 font-black text-[10px] ${task.priority === "URGENT" ? "bg-rose-500" : "bg-muted text-muted-foreground"}`}
              >
                <Flag className="w-3 h-3 mr-2" /> {task.priority}
              </Badge>
              {task.taskLabels.map((tl) => (
                <Badge
                  key={tl.label.id}
                  style={{ backgroundColor: tl.label.color }}
                  className="group rounded-xl pl-4 pr-2 py-1.5 font-black text-[10px] text-white border-none shadow-sm flex items-center gap-2"
                >
                  {tl.label.name}
                  <button
                    onClick={() => handleRemoveLabel(tl.label.id)}
                    className="h-4 w-4 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-white/40"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              ))}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-2 border-dashed h-8 px-4 font-black text-[9px] uppercase"
                  >
                    <Plus className="w-3 h-3 mr-2" /> Add Tag
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-56 rounded-2xl p-3 shadow-2xl border-2"
                >
                  {availableLabels.map((l) => (
                    <DropdownMenuItem
                      key={l.id}
                      disabled={task.taskLabels.some(
                        (tl) => tl.label.id === l.id,
                      )}
                      onClick={() => handleAssignLabel(l.id, l)}
                      className="flex items-center gap-3 rounded-xl cursor-pointer p-3 font-bold text-[10px] uppercase"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: l.color }}
                      />{" "}
                      {l.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {isEditingTitle ? (
              <Input
                autoFocus
                className="text-5xl md:text-8xl font-black tracking-tighter bg-transparent border-none border-b-8 border-primary rounded-none h-auto p-0 focus-visible:ring-0 leading-[0.85] pb-6"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (setIsEditingTitle(false),
                  handleMutation(
                    () =>
                      projectService.updateTask(
                        projectId as string,
                        taskId as string,
                        { title: titleInput },
                      ),
                    { title: titleInput },
                    "Title Redacted",
                  ))
                }
                onBlur={() => setIsEditingTitle(false)}
              />
            ) : (
              <h1
                className="text-5xl md:text-8xl font-black tracking-tighter cursor-pointer hover:text-primary transition-colors"
                onClick={() => setIsEditingTitle(true)}
              >
                {task.title}
              </h1>
            )}

            <p className="text-muted-foreground text-xl md:text-2xl font-medium border-l-8 border-muted pl-10 italic max-w-4xl">
              {task.description || "No description provided."}
            </p>
          </div>

          {/* ASSETS */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-primary/60">
                <Paperclip className="w-5 h-5" /> Assets
              </h3>
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                size="sm"
                variant="outline"
                className="rounded-xl border-2 font-black uppercase text-[9px] h-9"
              >
                {isUploading ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-2" />
                ) : (
                  <Plus className="w-3 h-3 mr-2" />
                )}{" "}
                Deploy File
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {attachments.map((file) => (
                <div
                  key={file.id}
                  className="group relative bg-muted/10 border-2 border-muted/50 rounded-3xl p-6 hover:border-primary/40 transition-all shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/5 p-3 rounded-2xl shrink-0">
                      <FileIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black truncate uppercase tracking-tight">
                        {file.name}
                      </p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase mt-2">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-background/95 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 px-6">
                    <Button
                      onClick={() => handleSecureDownload(file.id, file.name)}
                      disabled={isProcessingId === file.id}
                      className="flex-1 rounded-2xl font-black text-[10px] uppercase h-11"
                    >
                      Authorize
                    </Button>
                    {(file.userId === CURRENT_USER_ID ||
                      CURRENT_USER_ROLE === "OWNER") && (
                      <Button
                        onClick={async () => {
                          const original = [...attachments];
                          setAttachments((prev) =>
                            prev.filter((a) => a.id !== file.id),
                          );
                          try {
                            await projectService.deleteTaskAttachment(
                              taskId as string,
                              file.id,
                            );
                          } catch {
                            setAttachments(original);
                          }
                        }}
                        variant="ghost"
                        className="w-11 h-11 rounded-2xl hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-muted/50" />

          {/* TIMELINE */}
          <div className="space-y-12">
            <h3 className="text-[12px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-primary/60">
              <MessageSquare className="w-5 h-5" /> Operation Timeline
            </h3>
            <div className="space-y-10 max-h-[600px] overflow-y-auto pr-6 custom-scrollbar">
              {comments.map((comment) => (
                <div key={comment.id} className="group flex gap-6">
                  <Avatar className="h-12 w-12 border-2 border-muted shrink-0">
                    <AvatarImage src={comment.user.image} />
                    <AvatarFallback>
                      {comment.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 bg-muted/20 p-6 rounded-[2rem] flex-1 border border-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black uppercase tracking-tight text-primary/80">
                        {comment.user.name}
                      </span>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">
                        {formatDistanceToNow(new Date(comment.createdAt))} ago
                      </span>
                    </div>
                    <p className="text-base font-medium">{comment.message}</p>
                  </div>
                </div>
              ))}
              <div ref={scrollEndRef} />
            </div>
            <div className="relative pt-6">
              <Textarea
                placeholder="Submit encrypted transmission..."
                className="min-h-[140px] rounded-[3rem] border-4 border-muted bg-card p-8 pr-24 focus-visible:ring-primary transition-all resize-none shadow-2xl"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  (e.preventDefault(), handlePostComment())
                }
              />
              <Button
                onClick={handlePostComment}
                disabled={!commentInput.trim() || isSubmittingComment}
                className="absolute right-6 bottom-6 h-16 w-16 rounded-[1.5rem] shadow-2xl"
              >
                {isSubmittingComment ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Send className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT: COMMAND SIDEBAR */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-card border-4 border-muted/50 rounded-[4rem] p-12 space-y-16 shadow-2xl sticky top-12">
            {/* STATUS PIPELINE */}
            <div className="space-y-6">
              <label className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground ml-4">
                Workflow Pipeline
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={isMutating}
                    className={`w-full justify-between rounded-[2.5rem] h-24 px-10 font-black text-xl transition-all ${STATUS_CONFIG[task.status].color} text-white hover:scale-[1.02]`}
                  >
                    <span className="flex items-center gap-6">
                      {isMutating ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Check className="w-6 h-6" strokeWidth={4} />
                      )}
                      {STATUS_CONFIG[task.status].label}
                    </span>
                    <ChevronDown className="w-6 h-6 opacity-40" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[360px] rounded-[3rem] p-4 shadow-3xl border-4">
                  {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() =>
                        handleMutation(
                          () =>
                            projectService.updateTaskStatus(
                              projectId as string,
                              taskId as string,
                              s,
                            ),
                          { status: s },
                          `Status: ${s}`,
                        )
                      }
                      className="rounded-[2rem] h-16 mb-2 px-6 cursor-pointer font-black text-xs tracking-widest hover:bg-muted"
                    >
                      {STATUS_CONFIG[s].label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* SPECIALIST MODULE */}
            <div className="space-y-6">
              <label className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground ml-4 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5" /> Specialist
              </label>
              <DropdownMenu>
                <div className="relative group">
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-32 rounded-[3.5rem] border-4 border-dashed border-muted hover:border-primary/40 p-8 justify-between shadow-sm transition-all overflow-hidden bg-background/50"
                    >
                      <div className="flex items-center gap-6 text-left min-w-0">
                        {task.assignee ? (
                          <Avatar className="h-16 w-16 border-4 border-background shadow-2xl shrink-0 ring-2 ring-muted">
                            <AvatarImage src={task.assignee.image} />
                            <AvatarFallback>
                              {task.assignee.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-muted/40 flex items-center justify-center border-4 border-dashed border-muted/50 shrink-0">
                            <UserPlus className="w-8 h-8 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-black text-xl truncate tracking-tighter">
                            {task.assignee ? task.assignee.name : "Unassigned"}
                          </p>
                          <p className="text-[10px] font-black text-muted-foreground uppercase mt-2 tracking-widest">
                            Active Operative
                          </p>
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  {task.assignee && !isMutating && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMutation(
                          () =>
                            projectService.unassignTask(
                              projectId as string,
                              taskId as string,
                            ),
                          { assignedTo: null, assignee: undefined },
                          "Operative relieved",
                        );
                      }}
                      className="absolute -top-3 -right-3 h-11 w-11 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-2xl border-4 border-background hover:scale-110 active:scale-90 transition-all z-10"
                    >
                      <X className="w-5 h-5 stroke-[4]" />
                    </button>
                  )}
                </div>
                <DropdownMenuContent className="w-[380px] rounded-[4rem] p-6 shadow-3xl border-4">
                  <div className="relative mb-6 px-2">
                    <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Search Roster..."
                      className="pl-14 rounded-2xl border-muted bg-muted/10 text-xs h-14 font-black uppercase"
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                    {members
                      .filter((m) =>
                        m.user.name
                          .toLowerCase()
                          .includes(memberSearch.toLowerCase()),
                      )
                      .map((m) => (
                        <DropdownMenuItem
                          key={m.userId}
                          onClick={() =>
                            handleMutation(
                              () =>
                                projectService.assignTask(
                                  projectId as string,
                                  taskId as string,
                                  m.userId,
                                ),
                              {
                                assignedTo: m.userId,
                                assignee: {
                                  id: m.userId,
                                  name: m.user.name,
                                  image: m.user.image,
                                },
                              },
                              `Assigned: ${m.user.name}`,
                            )
                          }
                          className="rounded-[2.5rem] h-20 gap-5 px-6 cursor-pointer hover:bg-primary/5 transition-all"
                        >
                          <Avatar className="h-11 w-11 border-2 border-background">
                            <AvatarImage src={m.user.image} />
                            <AvatarFallback>
                              {m.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-black truncate uppercase tracking-tighter">
                              {m.user.name}
                            </p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                              {m.role}
                            </p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center justify-center gap-4 text-muted-foreground/30 py-4 animate-pulse">
              <RefreshCw className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">
                Secure Link Established
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
