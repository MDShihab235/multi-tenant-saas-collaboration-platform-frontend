"use client";

import { useEffect, useState } from "react";
import {
  organizationService,
  RolePermissionDetail,
} from "@/services/organization.service";
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Lock,
  ChevronRight,
  Fingerprint,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  orgId: string;
  roleId: string;
}

export default function RolePermissionMatrix({ orgId, roleId }: Props) {
  const [data, setData] = useState<RolePermissionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      if (!orgId || !roleId) return;
      try {
        setLoading(true);
        const res = await organizationService.getRolePermissions(orgId, roleId);
        setData(res);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        toast.error("Failed to load permissions", {
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };
    loadPermissions();
  }, [orgId, roleId]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Syncing permission matrix...
        </p>
      </div>
    );
  }

  // If no permissions are found
  if (!data || data.permissions.length === 0) {
    return (
      <div className="py-12 text-center border-2 border-dashed rounded-3xl bg-muted/10">
        <ShieldAlert className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
        <h3 className="font-bold text-lg">No Permissions Assigned</h3>
        <p className="text-sm text-muted-foreground max-w-62.5 mx-auto mt-1">
          This role currently has no active privileges. Click &quot;Edit
          Permissions&quot; to begin.
        </p>
      </div>
    );
  }

  // Grouping logic: "ORG_UPDATE" -> Resource: ORG, Action: UPDATE
  const groupedPermissions = data.permissions.reduce(
    (acc: Record<string, string[]>, curr) => {
      const resource = curr.resource || "General";
      if (!acc[resource]) acc[resource] = [];
      acc[resource].push(curr.action);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-6">
      {Object.keys(groupedPermissions).map((resource) => (
        <div
          key={resource}
          className="bg-background border rounded-2xl overflow-hidden shadow-sm hover:ring-1 hover:ring-primary/20 transition-all"
        >
          {/* Resource Header */}
          <div className="bg-muted/30 px-6 py-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-xs uppercase tracking-widest text-foreground">
                {resource} Settings
              </h3>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
              {groupedPermissions[resource].length} Actions
            </span>
          </div>

          {/* Actions Grid */}
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {groupedPermissions[resource].map((action: string) => (
              <div
                key={action}
                className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50 group hover:bg-primary/5 transition-colors"
              >
                <div className="bg-green-500/10 p-1.5 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                </div>
                <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                  {action.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Footer Meta Data */}
      <div className="flex items-center justify-between px-6 py-4 bg-muted/20 rounded-2xl border border-dashed">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Lock className="w-3.5 h-3.5" />
          <span>
            Total Unique Permissions:{" "}
            <b className="text-foreground">{data.total}</b>
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase">
          Security Audit <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}
