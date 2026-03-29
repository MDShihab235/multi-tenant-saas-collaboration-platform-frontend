"use client";

import { useState } from "react";
import { organizationService } from "@/services/organization.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ShieldPlus } from "lucide-react";

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  onSuccess: (roleId: string) => void;
}

export function CreateRoleModal({
  isOpen,
  onClose,
  orgId,
  onSuccess,
}: CreateRoleModalProps) {
  const [roleName, setRoleName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    setIsLoading(true);
    try {
      const newRole = await organizationService.createCustomRole(orgId, {
        name: roleName,
      });

      toast.success("Role Created", {
        description: `"${newRole.name}" is now available in your workspace.`,
      });

      setRoleName("");
      onSuccess(newRole.id); // Passes ID back to parent to open Permission screen
      onClose();
    } catch (error: any) {
      // Check for the unique constraint error message from your backend
      if (
        error.message.includes("P2002") ||
        error.message.includes("already exists")
      ) {
        toast.error("Role name taken", {
          description:
            "A role with this name already exists in this workspace.",
        });
      } else {
        toast.error("Database Error", {
          description: "Please check if the Organization ID is valid.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-106.25 rounded-3xl p-8">
        <DialogHeader>
          <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
            <ShieldPlus className="text-primary w-6 h-6" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            New Custom Role
          </DialogTitle>
          <DialogDescription>
            Give your role a unique name. You can assign specific permissions in
            the next step.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label
              htmlFor="role-name"
              className="text-xs font-bold uppercase text-muted-foreground ml-1"
            >
              Role Name
            </Label>
            <Input
              id="role-name"
              placeholder="e.g. Project Auditor"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="h-12 rounded-xl focus-visible:ring-primary"
              disabled={isLoading}
              autoFocus
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-xl h-12"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !roleName.trim()}
              className="rounded-xl h-12 px-8 font-bold"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Continue"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
