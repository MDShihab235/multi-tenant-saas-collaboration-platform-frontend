"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { planService } from "@/services/plan.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Settings2,
  CreditCard,
  ShieldCheck,
  Loader2,
  LayoutPanelLeft,
} from "lucide-react";
import { FieldGroup } from "@/components/ui/field";

export default function CreatePlan() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      priceMonthly: 0,
      priceYearly: 0,
      currency: "USD",
      trialDays: 14,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        await planService.createPlan(value);
        toast.success("Plan Created!", {
          description: "New pricing tier is now live in the catalog.",
        });
        form.reset();
      } catch (error: any) {
        toast.error("Creation Failed", { description: error.message });
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Pricing Management
          </h1>
          <p className="text-muted-foreground">
            Define new subscription tiers for the platform.
          </p>
        </div>
        <div className="bg-primary/10 p-3 rounded-2xl ring-1 ring-primary/20">
          <ShieldCheck className="w-6 h-6 text-primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Form */}
        <div className="lg:col-span-2 bg-card/50 border rounded-3xl p-8 backdrop-blur-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FieldGroup>
                <form.Field name="name">
                  {(field) => (
                    <div className="space-y-2">
                      <label className="text-sm font-medium pl-1">
                        Plan Name
                      </label>
                      <Input
                        placeholder="e.g. Pro Team"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>
                <form.Field name="slug">
                  {(field) => (
                    <div className="space-y-2">
                      <label className="text-sm font-medium pl-1">
                        Unique Slug
                      </label>
                      <Input
                        placeholder="pro-team"
                        className="font-mono text-xs"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value.toLowerCase().replace(/\s+/g, "-"),
                          )
                        }
                      />
                    </div>
                  )}
                </form.Field>
              </FieldGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FieldGroup>
                <form.Field name="priceMonthly">
                  {(field) => (
                    <div className="space-y-2">
                      <label className="text-sm font-medium pl-1 text-primary">
                        Monthly ($)
                      </label>
                      <Input
                        type="number"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                      />
                    </div>
                  )}
                </form.Field>
                <form.Field name="priceYearly">
                  {(field) => (
                    <div className="space-y-2">
                      <label className="text-sm font-medium pl-1 text-primary">
                        Yearly ($)
                      </label>
                      <Input
                        type="number"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                      />
                    </div>
                  )}
                </form.Field>
                <form.Field name="trialDays">
                  {(field) => (
                    <div className="space-y-2">
                      <label className="text-sm font-medium pl-1">
                        Trial Period (Days)
                      </label>
                      <Input
                        type="number"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                      />
                    </div>
                  )}
                </form.Field>
              </FieldGroup>
            </div>

            <Button
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Plus className="mr-2 h-5 w-5" />
              )}
              Create Plan & Configure Features
            </Button>
          </form>
        </div>

        {/* Live Preview Card */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground pl-1">
            Live Preview
          </h3>
          <div className="border-2 border-dashed border-muted-foreground/20 rounded-3xl p-6 bg-muted/5 flex flex-col items-center justify-center min-h-[300px] text-center">
            <CreditCard className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-xl font-bold">
              {form.state.values.name || "Untitled Plan"}
            </p>
            <p className="text-3xl font-black mt-4">
              ${form.state.values.priceMonthly}
              <span className="text-sm font-normal text-muted-foreground">
                /mo
              </span>
            </p>
            <div className="mt-6 w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary w-1/3" />
            </div>
            <p className="mt-4 text-xs text-muted-foreground italic">
              Trial: {form.state.values.trialDays} days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
