"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { organizationService } from "@/services/organization.service";
import RolesTable from "@/components/module/roles/RolesTable"; // Path to your component
import { Loader2, Shield } from "lucide-react";

export default function RolesSettingsPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;

  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgContext = async () => {
      try {
        const org = await organizationService.getOrganizationBySlug(orgSlug);
        setOrgId(org.id);
      } catch (err) {
        console.error("Failed to resolve org context");
      } finally {
        setLoading(false);
      }
    };
    fetchOrgContext();
  }, [orgSlug]);

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground">
            Manage custom access levels for members of{" "}
            <span className="font-semibold text-foreground">{orgSlug}</span>.
          </p>
        </div>
        <div className="p-2 bg-primary/5 rounded-lg border border-primary/10">
          <Shield className="h-6 w-6 text-primary" />
        </div>
      </header>

      {orgId ? (
        <RolesTable orgId={orgId} />
      ) : (
        <div className="p-12 border rounded-xl border-dashed text-center text-muted-foreground">
          Organization not found.
        </div>
      )}
    </div>
  );
}
