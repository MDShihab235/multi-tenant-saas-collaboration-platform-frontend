"use client";

import { useState, useEffect } from "react";
import { userService, Role } from "@/services/user.service";
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
import {
  Trash2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Users,
  Info,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";
import { organizationService } from "@/services/organization.service";

export default function RolesTable({ orgId }: { orgId: string }) {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchRoles = async () => {
    try {
      const data = await userService.getRoles(orgId);
      setRoles(data);
    } catch (err) {
      toast.error("Failed to load roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [orgId]);

  const handleDeleteRole = async (roleId: string, memberCount: number) => {
    if (memberCount > 0) {
      toast.error(
        `Cannot delete: ${memberCount} members are still assigned to this role.`,
      );
      return;
    }

    setIsDeleting(roleId);
    try {
      await organizationService.deleteRole(orgId, roleId);
      toast.success("Role deleted successfully.");
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete role.");
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading)
    return (
      <div className="text-center py-10">
        <Loader2 className="animate-spin mx-auto" />
      </div>
    );

  return (
    <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Role Name</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => {
            const memberCount = role._count?.memberships || 0;
            const isDeletable = memberCount === 0;

            return (
              <TableRow
                key={role.id}
                className="group transition-colors hover:bg-muted/30"
              >
                <TableCell className="font-semibold">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    {role.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className={`flex items-center gap-1.5 text-sm ${isDeletable ? "text-muted-foreground" : "text-amber-600 font-medium"}`}
                  >
                    <Users className="h-4 w-4" />
                    {memberCount} {memberCount === 1 ? "member" : "members"}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {/* EDIT BUTTON (Placeholder for your previous edit logic) */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>

                    {/* DELETE ACTION */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${isDeletable ? "text-muted-foreground hover:text-destructive" : "text-muted-foreground/30 cursor-not-allowed"}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>

                      {isDeletable ? (
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Role?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the **{role.name}
                              ** role? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteRole(role.id, memberCount)
                              }
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              {isDeleting === role.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Delete Role"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      ) : (
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
                              <AlertCircle className="h-5 w-5" />
                              Role in Use
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              You cannot delete the **{role.name}** role because
                              it is currently assigned to **{memberCount}{" "}
                              members**. Please reassign these members to a
                              different role before attempting to delete this
                              one.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="w-full">
                              Got it
                            </AlertDialogCancel>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      )}
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {roles.length === 0 && (
        <div className="p-12 text-center text-muted-foreground">
          No custom roles defined yet.
        </div>
      )}
    </div>
  );
}
