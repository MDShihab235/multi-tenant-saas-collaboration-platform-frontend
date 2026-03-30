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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard, Clock, Settings2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    priceMonthly: 0,
    priceYearly: 0,
    currency: "USD",
    trialDays: 14,
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newPlan = await adminService.createPlan(formData);
      setPlans((prev) => [...prev, newPlan]);
      setOpen(false);
      setFormData({
        name: "",
        slug: "",
        priceMonthly: 0,
        priceYearly: 0,
        currency: "USD",
        trialDays: 14,
      });
      toast.success("Subscription plan created successfully.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Unique slug required.");
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
            Manage pricing tiers and billing cycles for the platform.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreate}>
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
              <TableHead>Slug</TableHead>
              <TableHead>Pricing</TableHead>
              <TableHead>Trial Period</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Loading plans...
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-bold">{plan.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted p-1 rounded">
                      {plan.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="font-medium">
                        {plan.priceMonthly} {plan.currency}/mo
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {plan.priceYearly} {plan.currency}/yr
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {plan.trialDays} days
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Settings2 className="h-4 w-4 mr-2" /> Configure Features
                    </Button>
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
