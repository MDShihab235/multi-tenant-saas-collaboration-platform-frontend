"use client";

import { useState } from "react";
import { projectService } from "@/services/project.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ShieldCheck, ShieldAlert, User, Eye } from "lucide-react";
import { toast } from "sonner";

const ROLES = [
  {
    value: "OWNER",
    label: "Owner",
    icon: ShieldAlert,
    desc: "Full control & transfer",
  },
  {
    value: "MANAGER",
    label: "Manager",
    icon: ShieldCheck,
    desc: "Can manage members",
  },
  {
    value: "CONTRIBUTOR",
    label: "Contributor",
    icon: User,
    desc: "Can edit tasks",
  },
  { value: "VIEWER", label: "Viewer", icon: Eye, desc: "Read-only access" },
];

export function MemberRoleSelect({
  projectId,
  member,
  canManage,
}: {
  projectId: string;
  member: any;
  canManage: boolean;
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoleChange = async (newRole: string) => {
    if (newRole === member.role) return;

    setIsUpdating(true);
    try {
      await projectService.updateMemberRole(projectId, member.userId, newRole);

      if (newRole === "OWNER") {
        toast.success(`Ownership transferred to ${member.user.name}.`);
      } else {
        toast.success(`Role updated to ${newRole.toLowerCase()}.`);
      }

      // Data Flow: Trigger parent refetch via refresh
      window.location.reload();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update role.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isUpdating && (
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      )}
      <Select
        defaultValue={member.role}
        onValueChange={handleRoleChange}
        disabled={!canManage || isUpdating || member.role === "OWNER"}
      >
        <SelectTrigger className="w-[140px] h-8 text-xs font-medium">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((role) => (
            <SelectItem key={role.value} value={role.value} className="text-xs">
              <div className="flex flex-col">
                <span className="font-bold flex items-center gap-1">
                  <role.icon className="h-3 w-3" /> {role.label}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {role.desc}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
