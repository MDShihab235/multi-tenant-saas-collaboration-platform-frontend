"use client";

import { useState, useEffect } from "react";
import {
  organizationService,
  Membership,
} from "@/services/organization.service";
import { projectService } from "@/services/project.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Loader2, UserPlus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  orgId: string;
  existingMemberIds: string[];
  onSuccess: () => void;
}

export function AddProjectMemberModal({
  isOpen,
  onClose,
  projectId,
  orgId,
  existingMemberIds,
  onSuccess,
}: Props) {
  const [orgMembers, setOrgMembers] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("MEMBER");

  useEffect(() => {
    if (isOpen && orgId) {
      const fetchOrgMembers = async () => {
        setLoading(true);
        try {
          const data = await organizationService.getMemberships(orgId);
          // Filter out users already in the project
          setOrgMembers(
            data.filter((m) => !existingMemberIds.includes(m.userId)),
          );
        } catch (error) {
          toast.error("Could not load organization members");
        } finally {
          setLoading(false);
        }
      };
      fetchOrgMembers();
    }
  }, [isOpen, orgId, existingMemberIds]);

  const handleAdd = async () => {
    if (!selectedUserId) return;
    setSubmitting(true);
    try {
      await projectService.addProjectMember(projectId, {
        userId: selectedUserId,
        role: selectedRole as any,
      });
      toast.success("Member Added", {
        description: "User can now access this project.",
      });
      onSuccess();
      onClose();
      setSelectedUserId("");
    } catch (error: any) {
      toast.error("Error", { description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = orgMembers.filter(
    (m) =>
      m.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-8">
        <DialogHeader>
          <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
            <UserPlus className="text-primary w-6 h-6" />
          </div>
          <DialogTitle className="text-2xl font-black">
            Add Team Member
          </DialogTitle>
          <DialogDescription>
            Select a member from your organization to join this project.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* User Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Select Organization Member
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10 mb-2 rounded-xl border-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="max-h-50 overflow-y-auto border-2 rounded-2xl p-2 space-y-1 bg-muted/5">
              {loading ? (
                <div className="p-4 text-center">
                  <Loader2 className="animate-spin mx-auto w-4 h-4" />
                </div>
              ) : filtered.length > 0 ? (
                filtered.map((member) => (
                  <button
                    key={member.userId}
                    onClick={() => setSelectedUserId(member.userId)}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${
                      selectedUserId === member.userId
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src={member.user.image} />
                      <AvatarFallback className="text-[10px]">
                        {member.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left overflow-hidden">
                      <p className="text-xs font-bold truncate">
                        {member.user.name}
                      </p>
                      <p
                        className={`text-[10px] truncate ${selectedUserId === member.userId ? "opacity-80" : "text-muted-foreground"}`}
                      >
                        {member.user.email}
                      </p>
                    </div>
                    {selectedUserId === member.userId && (
                      <Check className="ml-auto w-4 h-4" />
                    )}
                  </button>
                ))
              ) : (
                <p className="text-[10px] text-center py-4 font-bold text-muted-foreground">
                  No available members found.
                </p>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Project Role
            </label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="h-12 rounded-xl border-2">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="MEMBER">
                  Contributor (Full Access)
                </SelectItem>
                <SelectItem value="VIEWER">Viewer (Read Only)</SelectItem>
                <SelectItem value="OWNER">Owner (Admin Access)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-xl h-12 flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!selectedUserId || submitting}
            className="rounded-xl h-12 flex-1 font-bold shadow-lg shadow-primary/20"
          >
            {submitting ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              "Add to Project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
