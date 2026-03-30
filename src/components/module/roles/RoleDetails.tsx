"use client";

import { useParams, useRouter } from "next/navigation";
import { useRoleData } from "@/hooks/use-role-data";
import { organizationService } from "@/services/organization.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Lock,
  Loader2,
  ShieldCheck,
  Fingerprint,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function RoleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { orgSlug, roleId } = params as { orgSlug: string; roleId: string };

  // DATA FLOW: Using the custom hook for clean state management
  const { role, setRole, loading, error } = useRoleData(orgSlug, roleId);

  // ACTION: Revoke Permission with Optimistic Rollback
  const handleRevoke = async (permId: string) => {
    if (!role) return;

    const previousPermissions = [...role.permissions];

    // Optimistic Update: Remove UI element immediately
    setRole({
      ...role,
      permissions: role.permissions.filter((p) => p.id !== permId),
    });

    try {
      const result = await organizationService.removePermission(
        role.organizationId,
        roleId,
        permId,
      );
      toast.success(
        `Revoked ${result.removedPermission.action} on ${result.removedPermission.resource}`,
      );
    } catch (err) {
      // Rollback: Restore previous state on failure
      setRole({ ...role, permissions: previousPermissions });
      toast.error("Failed to sync with server. Permission restored.");
    }
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );

  if (error || !role)
    return (
      <div className="p-12 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
        <p className="text-muted-foreground">
          We couldn&#39;t find that role or you lack access.
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Roles
        </Button>
        <Badge variant="outline" className="font-mono text-[10px]">
          ROLE_ID: {roleId}
        </Badge>
      </header>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          {role.name}
        </h1>
        <p className="text-muted-foreground">
          Managing granular permissions for members assigned to this role.
        </p>
      </div>

      <Card className="border-primary/10">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5" /> Active Permissions
              </CardTitle>
              <CardDescription>
                Uncheck a scope to revoke access immediately.
              </CardDescription>
            </div>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none">
              {role.permissions.length} Scopes Assigned
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {role.permissions.map((perm) => (
              <div
                key={perm.id}
                className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors"
              >
                <div className="flex gap-4 items-center">
                  <div className="p-2 bg-muted rounded-lg">
                    <Fingerprint className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold capitalize">
                      {perm.resource}
                    </span>
                    <span className="text-xs text-muted-foreground italic">
                      Can perform {perm.action.toLowerCase()} operations
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <Badge
                    variant="outline"
                    className="font-mono font-bold text-[10px]"
                  >
                    {perm.action}
                  </Badge>
                  <Checkbox
                    checked={true}
                    onCheckedChange={() => handleRevoke(perm.id)}
                    className="h-5 w-5 border-primary data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
            ))}

            {role.permissions.length === 0 && (
              <div className="p-20 text-center text-muted-foreground">
                <p>No permissions assigned to this role yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
