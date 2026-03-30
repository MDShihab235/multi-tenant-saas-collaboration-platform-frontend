"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { membershipService } from "@/services/membership.service";
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
  UserMinus,
  Shield,
  User,
  Loader2,
  Mail,
  MoreHorizontal,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function MembersPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;

  const [members, setMembers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchInitialData = async () => {
    try {
      const [membersData, userData] = await Promise.all([
        membershipService.getMembers(orgSlug),
        userService.getMe(),
      ]);
      setMembers(membersData);
      setCurrentUser(userData);
    } catch (err) {
      toast.error("Failed to load team data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [orgSlug]);

  const handleRemoveMember = async (userId: string, userName: string) => {
    setRemovingId(userId);
    try {
      // Assuming members list contains the organizationId
      const orgId = members[0]?.organizationId;
      await membershipService.removeMember(orgId, userId);

      toast.success(`${userName} has been removed from the team.`);

      // DATA FLOW: Filter out the removed member locally for immediate feedback
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove member.");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Check if current user is the owner of this org
  const isUserOwner =
    members.find((m) => m.userId === currentUser?.id)?.role === "OWNER";

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground">
            Manage roles and workspace access for your organization.
          </p>
        </div>
        <Button className="shrink-0">
          <Mail className="mr-2 h-4 w-4" /> Invite Member
        </Button>
      </div>

      <div className="border rounded-xl bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[300px]">Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined At</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.userId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage
                        src={member.user.image}
                        alt={member.user.name}
                      />
                      <AvatarFallback>
                        {member.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold flex items-center gap-1">
                        {member.user.name}
                        {member.userId === currentUser?.id && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-4 px-1 py-0 font-normal"
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
                  <Badge
                    variant={member.role === "OWNER" ? "default" : "secondary"}
                    className="gap-1 font-medium capitalize py-0.5"
                  >
                    {member.role === "OWNER" ? (
                      <ShieldCheck className="h-3 w-3" />
                    ) : (
                      <User className="h-3 w-3" />
                    )}
                    {member.role.toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(member.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {/* GUARD: Only owners can kick. Cannot kick yourself. */}
                  {isUserOwner && member.userId !== currentUser?.id ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remove {member.user.name}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will immediately revoke their access to this
                            workspace. They will no longer be able to view files
                            or contribute to projects.
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
                            disabled={removingId === member.userId}
                          >
                            {removingId === member.userId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Revoke Access"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled
                      className="opacity-30"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border border-blue-100 bg-blue-50/50 rounded-lg flex gap-3 text-sm text-blue-800">
        <Shield className="h-5 w-5 shrink-0" />
        <p>
          As an <strong>{isUserOwner ? "Owner" : "Member"}</strong>, you have
          {isUserOwner
            ? " full administrative control "
            : " limited read/write access "}
          over team permissions.
        </p>
      </div>
    </div>
  );
}
