"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  organizationService,
  Membership,
  OrganizationRole,
} from "@/services/organization.service";
import {
  Users,
  Mail,
  MoreHorizontal,
  UserMinus,
  ShieldAlert,
  Loader2,
  Search,
  UserPlus,
  Check,
  Shield,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// External Component Imports
import { InviteMemberModal } from "@/components/module/members/InviteMemberModal";
import { PendingInvitations } from "@/components/module/members/PendingInvitation";

export default function Members() {
  const { orgSlug } = useParams();

  // --- Core State ---
  const [members, setMembers] = useState<Membership[]>([]);
  const [roles, setRoles] = useState<OrganizationRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // --- Modal Visibility States ---
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // --- Change Role Specific State ---
  const [selectedMember, setSelectedMember] = useState<Membership | null>(null);
  const [newRoleId, setNewRoleId] = useState("");
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);

  // Replace with your actual Auth logic (e.g., useSession() from NextAuth)
  const currentUserId = "USER_ID_FROM_AUTH";
  const orgId = "ACTUAL_ORG_ID_FROM_CONTEXT";

  // --- Fetch Data ---
  const fetchData = async () => {
    if (!orgId || orgId === "ACTUAL_ORG_ID_FROM_CONTEXT") return;
    try {
      setLoading(true);
      const [membersData, rolesData] = await Promise.all([
        organizationService.getMemberships(orgId),
        organizationService.getOrganizationRoles(orgId),
      ]);
      setMembers(membersData);
      setRoles(rolesData);
    } catch (error: any) {
      toast.error("Error", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orgId, refreshKey]);

  // --- Action Handlers ---
  const openRoleEditor = (member: Membership) => {
    setSelectedMember(member);
    setNewRoleId(member.roleId);
    setIsRoleModalOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedMember || !newRoleId || !orgId) return;

    setIsSubmittingRole(true);
    try {
      await organizationService.updateMemberRole(
        orgId,
        selectedMember.userId,
        newRoleId,
      );
      toast.success("Permissions Updated", {
        description: `${selectedMember.user.name} now has a new role.`,
      });
      setIsRoleModalOpen(false);
      setRefreshKey((prev) => prev + 1); // Triggers re-fetch
    } catch (error: any) {
      toast.error("Action Failed", { description: error.message });
    } finally {
      setIsSubmittingRole(false);
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.user.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.user.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading && members.length === 0) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" /> Team Members
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage workspace access and permissions.
          </p>
        </div>
        <Button
          onClick={() => setIsInviteOpen(true)}
          className="rounded-xl font-bold shadow-lg shadow-primary/20"
        >
          <UserPlus className="w-4 h-4 mr-2" /> Invite Member
        </Button>
      </div>

      {/* 2. Main Tabs Area */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-2xl border">
          <TabsTrigger
            value="active"
            className="rounded-xl px-6 font-bold text-xs uppercase"
          >
            Active Members
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="rounded-xl px-6 font-bold text-xs uppercase"
          >
            Pending Invites
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b bg-muted/20 flex items-center gap-4">
              <Search className="w-4 h-4 text-muted-foreground ml-2" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-none bg-transparent focus-visible:ring-0 text-sm"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-muted-foreground border-b bg-muted/5">
                    <th className="px-6 py-4 font-bold">User</th>
                    <th className="px-6 py-4 font-bold">Role</th>
                    <th className="px-6 py-4 font-bold">Joined</th>
                    <th className="px-6 py-4 font-bold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                            <AvatarImage src={member.user.image} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold uppercase">
                              {member.user.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">
                              {member.user.name}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {member.user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase border border-primary/20">
                          {member.role.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-xl"
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-xl min-w-40"
                          >
                            <DropdownMenuItem
                              className="cursor-pointer"
                              disabled={member.userId === currentUserId}
                              onClick={() => openRoleEditor(member)}
                            >
                              <ShieldAlert className="w-4 h-4 mr-2" /> Change
                              Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive cursor-pointer focus:bg-destructive/10"
                              disabled={member.userId === currentUserId}
                            >
                              <UserMinus className="w-4 h-4 mr-2" /> Remove
                              Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <PendingInvitations orgId={orgId} refreshTrigger={refreshKey} />
        </TabsContent>
      </Tabs>

      {/* 3. Inlined Change Role Dialog */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="sm:max-w-105 rounded-[2rem] p-8">
          <DialogHeader>
            <div className="bg-amber-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
              <ShieldAlert className="text-amber-600 w-7 h-7" />
            </div>
            <DialogTitle className="text-2xl font-bold">
              Update Role
            </DialogTitle>
            <DialogDescription>
              Adjusting permissions for{" "}
              <span className="text-foreground font-semibold">
                {selectedMember?.user.name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">
              New Assignment
            </label>
            <Select onValueChange={setNewRoleId} value={newRoleId}>
              <SelectTrigger className="h-14 rounded-2xl border-2 mt-2 focus:ring-primary shadow-sm">
                <SelectValue placeholder="Choose a role..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {roles.map((role) => (
                  <SelectItem
                    key={role.id}
                    value={role.id}
                    className="py-3 cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-sm flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-primary" />{" "}
                        {role.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex-row gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsRoleModalOpen(false)}
              className="flex-1 rounded-2xl h-12"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={
                isSubmittingRole || newRoleId === selectedMember?.roleId
              }
              className="flex-1 rounded-2xl h-12 font-bold bg-amber-600 hover:bg-amber-700 shadow-md transition-all active:scale-95"
            >
              {isSubmittingRole ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" /> Update User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. External Invite Modal */}
      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        orgId={orgId}
        onSuccess={() => setRefreshKey((prev) => prev + 1)}
      />
    </div>
  );
}
