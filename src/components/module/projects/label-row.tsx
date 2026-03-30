"use client";

import { useState } from "react";
import { projectService, Label } from "@/services/project.service";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  AlertTriangle,
  Palette,
} from "lucide-react";
import { toast } from "sonner";

interface LabelRowProps {
  label: Label & { _count?: { taskLabels: number } };
  projectId: string;
  onUpdate: (updated: Label) => void;
  onDelete: (labelId: string) => void;
}

export function LabelRow({
  label,
  projectId,
  onUpdate,
  onDelete,
}: LabelRowProps) {
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(label.name);
  const [editColor, setEditColor] = useState(label.color);

  // Loading States
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const taskCount = label._count?.taskLabels || 0;

  const handleSave = async () => {
    if (!editName.trim()) return toast.error("Label name cannot be empty.");

    setIsSaving(true);
    try {
      const updated = await projectService.updateLabel(projectId, label.id, {
        name: editName,
        color: editColor,
      });
      onUpdate(updated);
      setIsEditing(false);
      toast.success("Label updated successfully.");
    } catch (err) {
      toast.error("Failed to update label.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await projectService.deleteLabel(projectId, label.id);
      onDelete(label.id);
      toast.success("Label removed from all tasks.");
    } catch (err) {
      toast.error("Failed to delete label.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setEditName(label.name);
    setEditColor(label.color);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-xl bg-card hover:border-primary/20 transition-all group">
      <div className="flex items-center gap-4 flex-1">
        {isEditing ? (
          <div className="flex items-center gap-3 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            {/* Native Color Picker Wrapper */}
            <div className="relative h-9 w-9 shrink-0 rounded-md border overflow-hidden shadow-sm">
              <input
                type="color"
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
                className="absolute -inset-2 h-16 w-16 cursor-pointer border-none"
              />
              <Palette className="absolute inset-0 m-auto h-4 w-4 text-white mix-blend-difference pointer-events-none" />
            </div>

            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-9 font-medium focus-visible:ring-primary"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
            />
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Badge
              style={{
                backgroundColor: label.color,
                color: "#fff",
                textShadow: "0px 1px 2px rgba(0,0,0,0.2)",
              }}
              className="px-3 py-1 border-none shadow-sm text-sm font-semibold"
            >
              {label.name}
            </Badge>
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">
                {label.color}
              </span>
              <span className="text-[10px] font-medium text-primary/60 italic">
                Used in {taskCount} {taskCount === 1 ? "task" : "tasks"}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        {isEditing ? (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-green-600 hover:bg-green-50"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-5 w-5" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-muted-foreground"
              onClick={handleCancel}
            >
              <X className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Delete this label?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-4">
                    <p>
                      Are you sure you want to delete{" "}
                      <span className="font-bold text-foreground">
                        &quot;{label.name}&quot;
                      </span>
                      ? This action is permanent.
                    </p>
                    {taskCount > 0 && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive">
                        <strong>Warning:</strong> This label will be removed
                        from <strong>{taskCount} tasks</strong> instantly.
                      </div>
                    )}
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
                    ) : (
                      "Delete Everywhere"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  );
}
