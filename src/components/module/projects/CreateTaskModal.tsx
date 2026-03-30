"use client";

import { useState, useEffect } from "react";
import { projectService, ProjectMember } from "@/services/project.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckSquare, Loader2, User, Flag, AlignLeft } from "lucide-react";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: () => void;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  projectId,
  onSuccess,
}: Props) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [priority, setPriority] = useState<string>("MEDIUM");

  useEffect(() => {
    if (isOpen) {
      const fetchMembers = async () => {
        setLoadingMembers(true);
        try {
          const data = await projectService.getProjectMembers(projectId);
          setMembers(data);
        } catch (error) {
          toast.error("Could not load assignees");
        } finally {
          setLoadingMembers(false);
        }
      };
      fetchMembers();
    }
  }, [isOpen, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await projectService.createTask(projectId, {
        title,
        description,
        assignedTo: assignedTo || undefined,
        priority: priority as any,
      });
      toast.success("Task Created", {
        description: "The team has been notified.",
      });

      // Reset & Close
      setTitle("");
      setDescription("");
      setAssignedTo("");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Error", { description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-125 rounded-[2.5rem] p-8">
        <DialogHeader>
          <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
            <CheckSquare className="text-primary w-6 h-6" />
          </div>
          <DialogTitle className="text-2xl font-black">
            Create New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1">
              Task Title
            </Label>
            <Input
              placeholder="What needs to be done?"
              className="h-12 rounded-xl border-2 font-bold focus-visible:ring-primary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1 flex items-center gap-2">
              <AlignLeft className="w-3 h-3" /> Description
            </Label>
            <Textarea
              placeholder="Add details..."
              className="rounded-xl border-2 min-h-25 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Assignee Selection */}
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1 flex items-center gap-2">
                <User className="w-3 h-3" /> Assignee
              </Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger className="h-12 rounded-xl border-2">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {members.map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={m.user.image} />
                          <AvatarFallback className="text-[8px]">
                            {m.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">
                          {m.user.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Selection */}
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1 flex items-center gap-2">
                <Flag className="w-3 h-3" /> Priority
              </Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="h-12 rounded-xl border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl font-bold">
                  <SelectItem value="LOW" className="text-slate-500">
                    Low
                  </SelectItem>
                  <SelectItem value="MEDIUM" className="text-blue-500">
                    Medium
                  </SelectItem>
                  <SelectItem value="HIGH" className="text-amber-500">
                    High
                  </SelectItem>
                  <SelectItem value="URGENT" className="text-rose-500">
                    Urgent
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button
              type="submit"
              disabled={submitting || !title.trim()}
              className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {submitting ? (
                <Loader2 className="animate-spin w-6 h-6" />
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
