"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  organizationService,
  OrganizationRole,
} from "@/services/organization.service";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Lock,
  Plus,
  MoreVertical,
  Users,
  Loader2,
  Settings2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function RolesSettings() {
  const { orgSlug } = useParams();
  const [roles, setRoles] = useState<OrganizationRole[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real app, retrieve orgId from your global Zustand/Context store
  const orgId = "UUID_FROM_STORE";

  useEffect(() => {
    const fetchRoles = async () => {
      if (!orgId) return;
      try {
        const data = await organizationService.getOrganizationRoles(orgId);
        setRoles(data);
      } catch (error: any) {
        toast.error("Error", { description: error.message });
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, [orgId]);

  if (loading)
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground mt-1">
            Define access levels for members of your workspace.
          </p>
        </div>
        <Button className="rounded-xl font-bold">
          <Plus className="w-4 h-4 mr-2" /> Create Custom Role
        </Button>
      </div>

      <div className="grid gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="group flex items-center justify-between p-6 bg-card border rounded-3xl hover:border-primary/50 transition-all shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-2xl group-hover:bg-primary/20 transition-colors">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{role.name}</h3>
                  {role.isSystemRole && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                      <Lock className="w-2.5 h-2.5" /> System
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {role.rolePermissions.map((rp) => (
                    <span
                      key={rp.permission}
                      className="text-[10px] bg-muted px-2 py-0.5 rounded-md font-mono text-muted-foreground"
                    >
                      {rp.permission.toLowerCase().replace("_", ":")}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right hidden md:block">
                <div className="flex items-center justify-end gap-1.5 text-sm font-semibold">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  {role._count.memberships}
                </div>
                <p className="text-[10px] text-muted-foreground uppercase">
                  Members
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings2 className="w-4 h-4 mr-2" /> Edit Permissions
                  </DropdownMenuItem>
                  {!role.isSystemRole && (
                    <DropdownMenuItem className="text-destructive cursor-pointer focus:bg-destructive/10">
                      Delete Role
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
