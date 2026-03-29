"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  organizationService,
  OrganizationRole,
} from "@/services/organization.service";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ChevronLeft,
  Users,
  Key,
  Loader2,
  Settings2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function RoleDetailPage() {
  const { orgSlug, roleId } = useParams();
  const router = useRouter();
  const [role, setRole] = useState<OrganizationRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock: Retrieve orgId from your global store (Zustand)
  const orgId = "UUID_FROM_STORE";

  useEffect(() => {
    const fetchRoleDetail = async () => {
      if (!orgId || !roleId) return;
      try {
        const data = await organizationService.getRoleById(
          orgId,
          roleId as string,
        );
        setRole(data);
      } catch (error: any) {
        toast.error("Access Denied", { description: error.message });
        router.push(`/${orgSlug}/settings/roles`);
      } finally {
        setLoading(false);
      }
    };
    fetchRoleDetail();
  }, [orgId, roleId, orgSlug, router]);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!role) return null;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Navigation Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => router.back()}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            {role.name}
            {role.isSystemRole && (
              <span className="text-[10px] bg-muted px-2 py-1 rounded-full text-muted-foreground uppercase tracking-widest">
                System Role
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">
            Manage permissions and view members assigned to this role.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Permission Matrix */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-card border rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" /> Active Permissions
              </h2>
              <Button size="sm" variant="outline" className="rounded-xl">
                <Settings2 className="w-4 h-4 mr-2" /> Edit Permissions
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {role.rolePermissions.length > 0 ? (
                role.rolePermissions.map((rp) => (
                  <div
                    key={rp.permission}
                    className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-transparent hover:border-primary/20 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-mono font-medium">
                      {rp.permission.toLowerCase().replace("_", ":")}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-10 text-center border-2 border-dashed rounded-3xl">
                  <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    No permissions assigned to this role yet.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Role Statistics & Members Sidebar */}
        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
              <Users className="w-4 h-4" /> Role Impact
            </h3>

            <div className="space-y-4">
              <div className="bg-background p-4 rounded-2xl border">
                <p className="text-2xl font-black">
                  {role._count?.memberships || 0}
                </p>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">
                  Assigned Members
                </p>
              </div>

              <p className="text-xs text-muted-foreground italic leading-relaxed">
                Changes to this role will immediately affect all{" "}
                {role._count?.memberships} members currently assigned to it.
              </p>
            </div>
          </div>

          {!role.isSystemRole && (
            <div className="p-6 border-2 border-dashed border-destructive/20 rounded-3xl bg-destructive/5">
              <h4 className="text-destructive font-bold text-sm mb-2">
                Danger Zone
              </h4>
              <p className="text-[11px] text-muted-foreground mb-4">
                Deleting this role will leave members without defined access.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="w-full rounded-lg"
              >
                Delete Role
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
