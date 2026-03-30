"use client";

import { useEffect, useState } from "react";
import {
  organizationService,
  PermissionImpactDetail,
} from "@/services/organization.service";
import {
  AlertTriangle,
  Building2,
  ShieldCheck,
  Loader2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Props {
  permId: string;
  onDeleteSuccess: () => void;
}

export function PermissionImpactPanel({ permId, onDeleteSuccess }: Props) {
  const [impact, setImpact] = useState<PermissionImpactDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        setIsLoading(true);
        const data = await organizationService.getPermissionImpact(permId);
        setImpact(data);
      } catch (err: any) {
        toast.error("Error", { description: err.message });
      } finally {
        setIsLoading(false);
      }
    };
    fetchImpact();
  }, [permId]);

  if (isLoading)
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (!impact) return null;

  const usageCount = impact._count.rolePermissions;

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 p-6 rounded-3xl border space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-tighter text-muted-foreground">
          Permission Identity
        </h2>
        <div className="flex items-center gap-2 font-mono text-lg font-bold">
          <span className="text-primary">{impact.resource}</span>
          <span className="text-muted-foreground/50">:</span>
          <span>{impact.action}</span>
        </div>
      </div>

      {/* Warning Card */}
      <div
        className={`p-6 rounded-3xl border-2 border-dashed ${usageCount > 0 ? "bg-destructive/5 border-destructive/20" : "bg-green-500/5 border-green-500/20"}`}
      >
        <div className="flex items-start gap-4">
          <AlertTriangle
            className={`w-6 h-6 shrink-0 ${usageCount > 0 ? "text-destructive" : "text-green-500"}`}
          />
          <div className="space-y-1">
            <h3 className="font-bold">System Impact Assessment</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {usageCount > 0
                ? `Deleting this will remove access for ${usageCount} roles across different organizations. This action cannot be undone.`
                : "This permission is not currently assigned to any roles. It is safe to delete."}
            </p>
          </div>
        </div>
      </div>

      {/* List of Affected Organizations */}
      {usageCount > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase ml-2">
            Active Deployments ({usageCount})
          </h4>
          <ScrollArea className="h-75 pr-4">
            <div className="space-y-2">
              {impact.rolePermissions.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-card border rounded-2xl"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-bold">
                        {item.role.organization.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Role: {item.role.name}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg h-8 w-8"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      <div className="pt-4 border-t">
        <Button
          variant="destructive"
          className="w-full rounded-xl h-12 font-bold shadow-lg shadow-destructive/10"
          onClick={() => {
            // Logic for DELETE /api/v1/permissions/:permId
            toast.promise(Promise.resolve(), {
              // Placeholder for actual delete call
              loading: "Deleting global permission...",
              success: "Permission removed from system catalog",
              error: "Failed to delete",
            });
          }}
        >
          <Trash2 className="w-4 h-4 mr-2" /> Cascade Delete Permission
        </Button>
      </div>
    </div>
  );
}
