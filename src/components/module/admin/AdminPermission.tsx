"use client";

import { useState, useEffect } from "react";
import {
  adminService,
  Permission,
  PermissionImpact,
} from "@/services/admin.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Search,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function AdminPermissionsPage() {
  // Data States
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Edit States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ action: "", resource: "" });

  // Delete States
  const [isDeleting, setIsDeleting] = useState(false);
  const [impactData, setImpactData] = useState<PermissionImpact | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      // Assuming a getPermissions call exists in your service
      const data = await adminService.getPermissions();
      setPermissions(data);
    } catch (error) {
      toast.error("Failed to load permissions catalog.");
    } finally {
      setLoading(false);
    }
  };

  // --- Inline Edit Logic ---
  const startEditing = (perm: Permission) => {
    setEditingId(perm.id);
    setEditForm({ action: perm.action, resource: perm.resource });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const updated = await adminService.updatePermission(id, editForm);
      setPermissions((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setEditingId(null);
      toast.success("Permission updated successfully.");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Update failed. Check for uniqueness.",
      );
    }
  };

  // --- Cascading Delete Logic ---
  const openDeleteFlow = async (permId: string) => {
    try {
      const impact = await adminService.getPermissionImpact(permId);
      setImpactData(impact);
      setShowDeleteDialog(true);
    } catch (error) {
      toast.error("Could not calculate permission impact.");
    }
  };

  const executeDelete = async () => {
    if (!impactData) return;
    setIsDeleting(true);
    try {
      await adminService.deletePermission(impactData.deletedPermission.id);
      setPermissions((prev) =>
        prev.filter((p) => p.id !== impactData.deletedPermission.id),
      );
      toast.success(
        `Deleted. Removed from ${impactData.cascadedRoleAssignments} roles.`,
      );
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("Deletion failed.");
    } finally {
      setIsDeleting(false);
      setImpactData(null);
    }
  };

  // Filtered view based on search
  const filteredPermissions = permissions.filter(
    (p) =>
      p.resource.toLowerCase().includes(search.toLowerCase()) ||
      p.action.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Permissions Catalog
          </h1>
          <p className="text-muted-foreground">
            Define and manage granular access controls across the platform.
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter permissions..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Action</TableHead>
              <TableHead className="w-[250px]">Resource</TableHead>
              <TableHead>Full Identifier</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  Loading catalog...
                </TableCell>
              </TableRow>
            ) : (
              filteredPermissions.map((perm) => (
                <TableRow key={perm.id}>
                  <TableCell>
                    {editingId === perm.id ? (
                      <Input
                        value={editForm.action}
                        onChange={(e) =>
                          setEditForm({ ...editForm, action: e.target.value })
                        }
                        className="h-8"
                      />
                    ) : (
                      <Badge variant="outline" className="font-mono">
                        {perm.action}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === perm.id ? (
                      <Input
                        value={editForm.resource}
                        onChange={(e) =>
                          setEditForm({ ...editForm, resource: e.target.value })
                        }
                        className="h-8"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {perm.resource}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs text-muted-foreground bg-muted px-1 rounded">
                      {perm.action}:{perm.resource}
                    </code>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {editingId === perm.id ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(perm.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing(perm)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDeleteFlow(perm.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Impact & Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Critical Action: Delete Permission
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                Deleting{" "}
                <Badge variant="secondary" className="font-mono">
                  {impactData?.deletedPermission.action}:
                  {impactData?.deletedPermission.resource}
                </Badge>{" "}
                is permanent.
              </p>
              <div className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive border border-destructive/20">
                Warning: This will instantly strip this permission from{" "}
                <strong>{impactData?.cascadedRoleAssignments} roles</strong>{" "}
                across all platform organizations.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Abort</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                executeDelete();
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Confirm Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
