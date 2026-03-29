"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  organizationService,
  OrganizationDetail,
} from "@/services/organization.service";
import { Button } from "@/components/ui/button";
import {
  Settings2,
  ShieldCheck,
  Users2,
  CreditCard,
  Crown,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export default function OrganizationSettings() {
  const { orgSlug } = useParams();
  const router = useRouter();
  const [org, setOrg] = useState<OrganizationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Note: In a real app, retrieve the numeric/UUID orgId
  // from your Zustand store/Context mapped by the orgSlug.
  const orgId = org?.id;

  useEffect(() => {
    const fetchSettings = async () => {
      if (!orgId) return;
      try {
        const data = await organizationService.getOrganizationById(orgId);
        setOrg(data);
      } catch (error: any) {
        toast.error("Access Denied", { description: error.message });
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [orgId, router]);

  if (loading)
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  if (!org) return null;

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-10">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Organization Settings
          </h1>
          <p className="text-muted-foreground italic">
            Managing workspace: {org.name}
          </p>
        </div>
        <div className="bg-primary/10 p-3 rounded-2xl ring-1 ring-primary/20">
          <Settings2 className="w-6 h-6 text-primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile & Ownership Section */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-card border rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> General
              Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Owner
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium text-sm">
                      {org.owner.name}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Member Count
                  </label>
                  <div className="flex items-center gap-2 mt-1 text-sm font-medium">
                    <Users2 className="w-4 h-4 text-primary" />{" "}
                    {org._count.members} Members
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Roles Configuration */}
          <section className="bg-card border rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Roles & Permissions</h2>
            <div className="space-y-3">
              {org.roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50"
                >
                  <span className="font-semibold text-sm">{role.name}</span>
                  <div className="flex gap-1">
                    {role.permissions.slice(0, 2).map((p) => (
                      <span
                        key={p}
                        className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase"
                      >
                        {p.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar: Subscription Status */}
        <div className="md:col-span-1">
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 sticky top-24">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Subscription
            </h3>
            <div className="mb-6">
              <p className="text-2xl font-black">
                {org.subscription?.plan?.name || "Free Tier"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Status:{" "}
                <span className="text-green-500 font-bold uppercase">
                  {org.subscription?.status || "Active"}
                </span>
              </p>
            </div>
            <Button
              className="w-full rounded-xl shadow-lg shadow-primary/10"
              variant="default"
            >
              Manage Billing
            </Button>
          </div>

          <div className="mt-6 p-6 border-2 border-dashed border-destructive/20 rounded-3xl bg-destructive/5">
            <h4 className="text-destructive font-bold text-sm flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" /> Danger Zone
            </h4>
            <p className="text-[11px] text-muted-foreground mb-4">
              Deleting this organization will permanently remove all projects
              and data.
            </p>
            <Button
              variant="destructive"
              size="sm"
              className="w-full rounded-lg"
            >
              Delete Workspace
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
