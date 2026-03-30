"use client";

import { useEffect, useState } from "react";
import { adminService, Plan, PlanFeature } from "@/services/admin.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Save,
  AlertTriangle,
  Loader2,
  Info,
  PowerOff,
  CheckCircle2,
  Zap,
  Plus,
  Infinity,
  Trash2,
  XCircle,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminPlanDetailView() {
  // --- Internal ID Discovery ---
  // In a real app, you might get this from a Global State or an API that returns the "current" plan context.
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  // --- UI & Data States ---
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [features, setFeatures] = useState<PlanFeature[]>([]);

  // Form States
  const [planForm, setPlanForm] = useState({
    name: "",
    priceMonthly: 0,
    priceYearly: 0,
    trialDays: 0,
  });
  const [isAddFeatureOpen, setIsAddFeatureOpen] = useState(false);
  const [featureForm, setFeatureForm] = useState({
    name: "",
    limitValue: "" as string | number,
    isEnabled: true,
  });

  // 1. Initial Data Fetch (Triggered when activePlanId is set)
  useEffect(() => {
    if (!activePlanId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await adminService.getPlanDetail(activePlanId);
        setPlan(data);
        setFeatures((data as any).features || []);
        setPlanForm({
          name: data.name,
          priceMonthly: data.priceMonthly,
          priceYearly: data.priceYearly,
          trialDays: data.trialDays,
        });
      } catch (err) {
        toast.error("Failed to sync plan data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activePlanId]);

  // --- Handlers: Plan ---
  const handleUpdatePlan = async () => {
    if (!activePlanId) return;
    setSaving(true);
    try {
      const updated = await adminService.updatePlan(activePlanId, planForm);
      setPlan(updated);
      toast.success("Pricing and core settings updated.");
    } catch (err) {
      toast.error("Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivatePlan = async () => {
    if (!activePlanId) return;
    try {
      const deactivated = await adminService.deactivatePlan(activePlanId);
      setPlan(deactivated);
      toast.success("Plan retired from public catalog.");
    } catch (err) {
      toast.error("Deactivation failed.");
    }
  };

  // --- Handlers: Features ---
  const handleAddFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlanId) return;
    try {
      const payload = {
        ...featureForm,
        limitValue:
          featureForm.limitValue === "" ? null : Number(featureForm.limitValue),
      };
      const newFeat = await adminService.addPlanFeature(activePlanId, payload);
      setFeatures([...features, newFeat]);
      setIsAddFeatureOpen(false);
      setFeatureForm({ name: "", limitValue: "", isEnabled: true });
      toast.success("Usage limit added.");
    } catch (err) {
      toast.error("Feature creation failed.");
    }
  };

  const handleToggleFeature = async (featId: string, isEnabled: boolean) => {
    if (!activePlanId) return;
    try {
      const updated = await adminService.updatePlanFeature(
        activePlanId,
        featId,
        { isEnabled },
      );
      setFeatures((prev) => prev.map((f) => (f.id === featId ? updated : f)));
    } catch (err) {
      toast.error("Failed to toggle status.");
    }
  };

  const handleDeleteFeature = async (featId: string) => {
    if (!activePlanId) return;
    try {
      await adminService.deletePlanFeature(activePlanId, featId);
      setFeatures((prev) => prev.filter((f) => f.id !== featId));
      toast.success("Limit removed.");
    } catch (err) {
      toast.error("Deletion failed.");
    }
  };

  // Placeholder view if no plan is selected
  if (!activePlanId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 border-2 border-dashed rounded-xl">
        <Settings2 className="h-12 w-12 text-muted-foreground animate-pulse" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">No Plan Selected</h3>
          <p className="text-muted-foreground text-sm">
            Select a plan from the list to begin editing configuration.
          </p>
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {plan?.name} Configuration
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Platform Identifier: {plan?.slug}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setActivePlanId(null)}>
            Close Editor
          </Button>
          <Button onClick={handleUpdatePlan} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save All Changes
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Core Plan Config */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Billing</CardTitle>
              <CardDescription>
                Updates here apply to new subscribers only.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Monthly Price (USD)</Label>
                <Input
                  type="number"
                  value={planForm.priceMonthly}
                  onChange={(e) =>
                    setPlanForm({
                      ...planForm,
                      priceMonthly: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Yearly Price (USD)</Label>
                <Input
                  type="number"
                  value={planForm.priceYearly}
                  onChange={(e) =>
                    setPlanForm({
                      ...planForm,
                      priceYearly: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Trial Period (Days)</Label>
                <Input
                  type="number"
                  value={planForm.trialDays}
                  onChange={(e) =>
                    setPlanForm({
                      ...planForm,
                      trialDays: Number(e.target.value),
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Features Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="text-amber-500 h-5 w-5" /> Feature Toggles &
                  Limits
                </CardTitle>
                <CardDescription>
                  Usage constraints enforced by middleware immediately.
                </CardDescription>
              </div>
              <Dialog
                open={isAddFeatureOpen}
                onOpenChange={setIsAddFeatureOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" /> Add Feature
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleAddFeature} className="space-y-4">
                    <DialogHeader>
                      <DialogTitle>Define New Limit</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                      <Label>Key Name (Slug)</Label>
                      <Input
                        required
                        placeholder="max_storage_gb"
                        value={featureForm.name}
                        onChange={(e) =>
                          setFeatureForm({
                            ...featureForm,
                            name: e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, "_"),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Limit Value (Null for Unlimited)</Label>
                      <Input
                        type="number"
                        placeholder="∞"
                        value={featureForm.limitValue}
                        onChange={(e) =>
                          setFeatureForm({
                            ...featureForm,
                            limitValue: e.target.value,
                          })
                        }
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full">
                        Add to Plan
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No features defined for this tier.
                </p>
              ) : (
                features.map((feat) => (
                  <div
                    key={feat.id}
                    className="flex items-center justify-between p-4 border rounded-xl bg-card/50"
                  >
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={feat.isEnabled}
                        onCheckedChange={(val) =>
                          handleToggleFeature(feat.id, val)
                        }
                      />
                      <span className="font-mono text-sm font-bold tracking-tight">
                        {feat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="px-3 py-1 font-mono"
                      >
                        {feat.limitValue ?? <Infinity className="h-3 w-3" />}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFeature(feat.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Sidebar */}
        <div className="space-y-6">
          <Card
            className={
              plan?.isActive
                ? "border-green-500/20 bg-green-50/10"
                : "bg-muted/50"
            }
          >
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Visibility Status
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-4 gap-2">
              {plan?.isActive ? (
                <CheckCircle2 className="text-green-500 h-12 w-12" />
              ) : (
                <XCircle className="text-muted-foreground h-12 w-12" />
              )}
              <span className="font-black text-lg tracking-tighter italic">
                {plan?.isActive ? "PUBLIC" : "LEGACY"}
              </span>
            </CardContent>
          </Card>

          {plan?.isActive && (
            <Card className="border-destructive/20 bg-destructive/[0.01]">
              <CardHeader>
                <CardTitle className="text-sm text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Retirement Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Deactivate Tier
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will hide the plan from your checkout. Existing
                        subscribers <strong>will not</strong> be canceled, but
                        they will be on a &quot;legacy&quot; plan that can no
                        longer be purchased.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeactivatePlan}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Confirm Deactivation
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
