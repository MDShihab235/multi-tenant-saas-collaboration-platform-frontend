"use client";

import { useEffect, useState } from "react";
import { adminService, Plan } from "@/services/admin.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Clock,
  Settings2,
  Trash2,
  CheckCircle2,
  XCircle,
  Hash,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    priceMonthly: 0,
    priceYearly: 0,
    currency: "USD",
    trialDays: 14,
  });
  // Feature Dialog State
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [featureFormData, setFeatureFormData] = useState({
    name: "",
    featureCode: "",
    limitValue: 0,
    isEnabled: true,
  });
  const fetchPlans = async () => {
    try {
      const data = await adminService.getPlans();
      setPlans(data);
    } catch (error) {
      toast.error("Failed to load plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // --- Plan Handlers ---
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... existing plan creation logic
    try {
      const newPlan = await adminService.createPlan(formData);
      setPlans((prev) => [...prev, newPlan]);
      setCreateOpen(false);
      setFormData({
        name: "",
        slug: "",
        priceMonthly: 0,
        priceYearly: 0,
        currency: "USD",
        trialDays: 14,
      });
      toast.success("Subscription plan created successfully.");
    } catch (error: unknown) {
      toast.error(
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
          "Unique slug is required. Please choose a different slug.",
      );
    }
  };

  const handleDeactivatePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to deactivate this plan?")) return;
    try {
      await adminService.deactivatePlan(planId);
      setPlans((prev) => prev.filter((p) => p.id !== planId));
      toast.success("Plan deactivated successfully.");
    } catch (error: unknown) {
      toast.error(
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
          "Deactivation failed. Ensure no active subscriptions are using this plan.",
      );
    }
  };

  // --- Feature Handlers ---
  const handleAddFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    try {
      const newFeature = await adminService.addPlanFeature(
        selectedPlan.id,
        featureFormData,
      );

      // Update local state for the specific plan's features
      setPlans((prev) =>
        prev.map((p) =>
          p.id === selectedPlan.id
            ? { ...p, features: [...(p.features || []), newFeature] }
            : p,
        ),
      );

      // Update the currently viewed selectedPlan features list
      setSelectedPlan((prev) =>
        prev
          ? {
              ...prev,
              features: [...(prev.features || []), newFeature],
            }
          : null,
      );

      setFeatureFormData({
        name: "",
        featureCode: "",
        limitValue: 0,
        isEnabled: true,
      });
      toast.success("Feature added to plan.");
    } catch (error: unknown) {
      toast.error(
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to add feature.",
      );
    }
  };

  const handleRemoveFeature = async (featureId: string) => {
    if (!selectedPlan) return;
    try {
      await adminService.deletePlanFeature(selectedPlan.id, featureId);

      const updatedFeatures =
        selectedPlan.features?.filter((f) => f.id !== featureId) || [];

      setPlans((prev) =>
        prev.map((p) =>
          p.id === selectedPlan.id ? { ...p, features: updatedFeatures } : p,
        ),
      );
      setSelectedPlan((prev) =>
        prev ? { ...prev, features: updatedFeatures } : null,
      );

      toast.success("Feature removed.");
    } catch (error: unknown) {
      toast.error(
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to remove feature.",
      );
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Subscription Plans
          </h1>
          <p className="text-muted-foreground">
            Manage pricing tiers and feature limits.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-106.25">
            <form onSubmit={handleCreatePlan}>
              <DialogHeader>
                <DialogTitle>Add New Pricing Tier</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Plan Name</Label>
                    <Input
                      id="name"
                      placeholder="Pro"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (Unique)</Label>
                    <Input
                      id="slug"
                      placeholder="pro-tier"
                      required
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "-"),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthly">Monthly Price</Label>
                    <Input
                      id="monthly"
                      type="number"
                      required
                      value={formData.priceMonthly}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priceMonthly: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearly">Yearly Price</Label>
                    <Input
                      id="yearly"
                      type="number"
                      required
                      value={formData.priceYearly}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priceYearly: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={formData.currency}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currency: e.target.value.toUpperCase(),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trial">Trial Days</Label>
                    <Input
                      id="trial"
                      type="number"
                      value={formData.trialDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trialDays: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">
                  Create Plan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan Name</TableHead>
              <TableHead>Pricing (M/Y)</TableHead>
              <TableHead>Features</TableHead>
              <TableHead>Trial</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-bold">{plan.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>
                        {plan.priceMonthly} / {plan.priceYearly} {plan.currency}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {plan.features?.length || 0} Features
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm gap-1">
                      <Clock className="h-3 w-3" /> {plan.trialDays}d
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog
                      onOpenChange={(open) => open && setSelectedPlan(plan)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Settings2 className="h-4 w-4 mr-2" /> Manage Features
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-150">
                        <DialogHeader>
                          <DialogTitle>Features for {plan.name}</DialogTitle>
                        </DialogHeader>

                        {/* Add Feature Form */}
                        <form
                          onSubmit={handleAddFeature}
                          className="grid grid-cols-4 gap-2 items-end pb-4 border-b"
                        >
                          <div className="col-span-1 space-y-1">
                            <Label className="text-xs">Name</Label>
                            <Input
                              placeholder="Projects"
                              value={featureFormData.name}
                              onChange={(e) =>
                                setFeatureFormData({
                                  ...featureFormData,
                                  name: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="col-span-1 space-y-1">
                            <Label className="text-xs">Code</Label>
                            <Input
                              placeholder="max_projects"
                              value={featureFormData.featureCode}
                              onChange={(e) =>
                                setFeatureFormData({
                                  ...featureFormData,
                                  featureCode: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="col-span-1 space-y-1">
                            <Label className="text-xs">Limit (-1=∞)</Label>
                            <Input
                              type="number"
                              value={featureFormData.limitValue}
                              onChange={(e) =>
                                setFeatureFormData({
                                  ...featureFormData,
                                  limitValue: Number(e.target.value),
                                })
                              }
                              required
                            />
                          </div>
                          <Button type="submit" size="sm" className="w-full">
                            Add
                          </Button>
                        </form>

                        {/* Features List */}
                        <div className="pt-4 space-y-3 max-h-[40vh] overflow-y-auto">
                          {selectedPlan?.features?.length === 0 ? (
                            <p className="text-sm text-center text-muted-foreground py-4">
                              No features defined yet.
                            </p>
                          ) : (
                            selectedPlan?.features?.map((feature) => (
                              <div
                                key={feature.id}
                                className="flex items-center justify-between p-2 rounded-md bg-muted/50 border"
                              >
                                <div className="flex items-center gap-3">
                                  {feature.isEnabled ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-destructive" />
                                  )}
                                  <div>
                                    <p className="text-sm font-medium">
                                      {feature.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground font-mono">
                                      {feature.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <Badge
                                    variant="outline"
                                    className="flex gap-1 items-center"
                                  >
                                    <Hash className="h-3 w-3" />{" "}
                                    {feature.limitValue === -1
                                      ? "Unlimited"
                                      : feature.limitValue}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveFeature(feature.id)
                                    }
                                    className="text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <div className="flex items-center text-sm gap-1">
                      <Button
                        onClick={() => handleDeactivatePlan(plan?.id as string)}
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Deactivate
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
