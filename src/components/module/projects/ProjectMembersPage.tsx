"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { projectService } from "@/services/project.service";
import { userService } from "@/services/user.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  UserX,
  Loader2,
  Info,
  ShieldAlert,
  UserPlus,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MemberRoleSelect } from "@/components/module/roles/MemberRolesSelect";

export default function ProjectMembersPage() {
  // 1. Extract context from URL
  const params = useParams();
  const projectSlug = params.projectSlug as string;

  // 2. State Management
  const [members, setMembers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      // Parallel fetch for members and current user session
      const [membersData, userData] = await Promise.all([
        projectService.getProjectMembers(projectSlug),
        userService.getMe(),
      ]);
      setMembers(membersData);
      setCurrentUser(userData);
    } catch (err) {
      toast.error("Failed to load project team data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectSlug) fetchData();
  }, [projectSlug]);

  const handleRemoveMember = async (userId: string, userName: string) => {
    setIsProcessing(userId);
    try {
      // Assuming members[0] contains the actual projectId needed for the API
      const projectId = members[0]?.projectId;
      await projectService.removeProjectMember(projectId, userId);

      toast.success(`${userName} removed from the project.`);

      // Data Flow: Optimistic UI update
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Action denied. Requires Manager/Owner role.",
      );
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Team</h1>
          <p className="text-sm text-muted-foreground">
            Members assigned to{" "}
            <span className="font-semibold text-foreground">{projectSlug}</span>
          </p>
        </div>
        <Button className="shrink-0 bg-primary hover:bg-primary/90">
          <UserPlus className="mr-2 h-4 w-4" /> Add Member
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Members Table */}
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[300px]">User</TableHead>
              <TableHead>Project Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow
                key={member.userId}
                className="transition-colors hover:bg-muted/20"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage src={member.user.image} />
                      <AvatarFallback>{member.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        {member.user.name}
                        {member.userId === currentUser?.id && (
                          <Badge
                            variant="secondary"
                            className="ml-2 text-[10px] h-4 py-0"
                          >
                            You
                          </Badge>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {member.user.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize font-medium">
                    {member.role.toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground italic">
                  {new Date(member.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  {/* Guard: Cannot remove self via kick endpoint */}
                  {member.userId !== currentUser?.id && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-destructive" />
                            Confirm Removal
                          </AlertDialogTitle>
                          <AlertDialogDescription className="space-y-4">
                            <p>
                              Are you sure you want to remove{" "}
                              <strong>{member.user.name}</strong> from this
                              project?
                            </p>
                            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-3 text-xs text-amber-800">
                              <Info className="h-4 w-4 shrink-0" />
                              <span>
                                <strong>Important:</strong> Task assignments
                                persist. Existing tasks assigned to this user
                                will <em>not</em> be automatically unassigned.
                              </span>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemoveMember(
                                member.userId,
                                member.user.name,
                              );
                            }}
                            className="bg-destructive text-white hover:bg-destructive/90"
                            disabled={isProcessing === member.userId}
                          >
                            {isProcessing === member.userId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Remove Access"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
                <TableCell>
                  <MemberRoleSelect
                    projectId={member.projectId}
                    member={member}
                    canManage={
                      currentUser?.role === "OWNER" ||
                      currentUser?.role === "MANAGER"
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredMembers.length === 0 && !loading && (
          <div className="p-12 text-center text-muted-foreground">
            No project members found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
