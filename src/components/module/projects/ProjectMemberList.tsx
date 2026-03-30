"use client";

import { useEffect, useState, useCallback } from "react";
import { projectService, ProjectMember } from "@/services/project.service";
import {
  Users,
  Mail,
  ShieldCheck,
  UserPlus,
  MoreVertical,
  UserMinus,
  Loader2,
  Search,
  Shield,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Internal Component
import { AddProjectMemberModal } from "./AddProjectMemberModal";

interface Props {
  projectId: string;
  orgId: string; // Passed down from the ProjectDetailPage
}

export function ProjectMemberList({ projectId, orgId }: Props) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjectMembers(projectId);
      setMembers(data);
    } catch (err: any) {
      toast.error("Failed to load members", { description: err.message });
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const filteredMembers = members.filter(
    (m) =>
      m.user.name.toLowerCase().includes(search.toLowerCase()) ||
      m.user.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading && members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Loading Roster...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-11 h-12 rounded-2xl border-2 border-muted focus-visible:ring-primary bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4 mr-2" /> Add Project Member
        </Button>
      </div>

      {/* 2. Member Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="bg-card border-2 border-muted/50 rounded-[1.5rem] p-5 flex items-center justify-between hover:border-primary/30 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                  <AvatarImage src={member.user.image} />
                  <AvatarFallback className="bg-primary/5 text-primary font-bold">
                    {member.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {member.role === "OWNER" && (
                  <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1 border-2 border-background">
                    <Shield className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
              <div className="space-y-0.5 max-w-35 md:max-w-45">
                <p className="font-bold text-sm truncate">{member.user.name}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 truncate font-medium">
                  <Mail className="w-3 h-3" /> {member.user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-lg bg-muted text-[9px] font-black uppercase text-muted-foreground tracking-tighter border">
                {member.role}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl h-8 w-8"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="rounded-xl min-w-35"
                >
                  <DropdownMenuItem className="text-destructive focus:bg-destructive/10 cursor-pointer font-bold text-xs">
                    <UserMinus className="w-4 h-4 mr-2" /> Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}

        {/* Empty Search State */}
        {filteredMembers.length === 0 && (
          <div className="col-span-full text-center py-20 border-2 border-dashed rounded-[3rem] bg-muted/5">
            <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-bold">
              No teammates found.
            </p>
          </div>
        )}
      </div>

      {/* 3. Add Member Modal */}
      <AddProjectMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        projectId={projectId}
        orgId={orgId}
        existingMemberIds={members.map((m) => m.userId)}
        onSuccess={fetchMembers} // Triggers the list to refresh
      />
    </div>
  );
}
