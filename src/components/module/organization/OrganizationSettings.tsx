"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  organizationService,
  Organization,
} from "@/services/organization.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Settings2,
  Globe,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export default function OrganizationGeneralSettings() {
  const router = useRouter();
  const params = useParams();
  const currentSlug = params.orgSlug as string;

  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        // Assuming you have a way to get the current org by slug or from a store
        const data =
          await organizationService.getOrganizationBySlug(currentSlug);
        setOrg(data);
        setFormData({ name: data.name, slug: data.slug });
      } catch (err) {
        toast.error("Failed to load organization settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, [currentSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;

    const slugChanged = formData.slug !== org.slug;
    setIsSaving(true);

    try {
      const updated = await organizationService.updateOrganization(
        org.id,
        formData,
      );

      toast.success("Organization updated successfully.");

      // DATA FLOW: If slug changed, redirect to the new URL path immediately
      if (slugChanged) {
        toast.info(`Redirecting to /${updated.slug}...`);
        router.push(`/${updated.slug}/settings`);
        router.refresh();
      } else {
        setOrg(updated);
        setIsSaving(false);
      }

      // Optional: Trigger a global refetch of the user's organization list
      window.dispatchEvent(new CustomEvent("org-list-updated"));
    } catch (err: any) {
      const msg = err.response?.data?.message || "Slug might already be taken.";
      toast.error(msg);
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-12 text-center text-muted-foreground">
        Loading organization...
      </div>
    );

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization identity and public presence.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Identity
            </CardTitle>
            <CardDescription>
              Update your workspace name and unique URL identifier.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Acme Corp"
                required
              />
            </div>

            {/* Organization Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Workspace Slug (URL)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
                  app.yoursite.com/
                </span>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    })
                  }
                  className="pl-[115px] font-mono text-sm"
                  placeholder="acme-corp"
                  required
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Only lowercase letters, numbers, and hyphens allowed.
              </p>
            </div>

            {/* Slug Change Warning */}
            {formData.slug !== org?.slug && (
              <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div className="text-xs space-y-1">
                  <p className="font-bold">Warning: URL Change Detected</p>
                  <p>
                    Changing the slug will break all existing links to this
                    workspace. You will be redirected to the new URL
                    immediately.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
