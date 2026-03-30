"use client";

import { useState } from "react";
import { projectService } from "@/services/project.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tag, Loader2, Pipette } from "lucide-react";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: () => void;
}

const PRESET_COLORS = [
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

export function CreateLabelModal({
  isOpen,
  onClose,
  projectId,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await projectService.createLabel(projectId, { name, color });
      toast.success("Label Created", {
        description: `"${name}" is now available.`,
      });
      setName("");
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
      <DialogContent className="sm:max-w-100 rounded-[2rem] p-8">
        <DialogHeader>
          <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
            <Tag className="text-primary w-6 h-6" />
          </div>
          <DialogTitle className="text-2xl font-black">
            New Project Label
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1">
              Label Name
            </Label>
            <Input
              placeholder="e.g., Critical Bug"
              className="h-12 rounded-xl border-2 font-bold"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1">
              Pick Color
            </Label>
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? "border-primary scale-125 shadow-sm" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <div className="relative w-8 h-8 rounded-full border-2 border-muted overflow-hidden">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 w-full h-full scale-150 cursor-pointer p-0 border-none"
                />
              </div>
            </div>

            {/* Live Preview */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-dashed flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                Preview
              </span>
              <div
                className="px-4 py-1.5 rounded-full text-xs font-black shadow-sm flex items-center gap-2"
                style={{
                  backgroundColor: color + "20",
                  color: color,
                  border: `1px solid ${color}40`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {name || "Label Preview"}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={submitting || !name.trim()}
              className="w-full h-12 rounded-xl font-bold text-lg shadow-lg shadow-primary/20"
            >
              {submitting ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                "Create Label"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
