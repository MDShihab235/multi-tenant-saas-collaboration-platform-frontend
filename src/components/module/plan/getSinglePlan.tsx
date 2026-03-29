"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { planService, Plan } from "@/services/plan.service";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Zap,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";

export default function PlanDetails() {
  const { planId } = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        const data = await planService.getPlanById(planId as string);
        setPlan(data);
      } catch (error: any) {
        toast.error("Error", { description: error.message });
        router.push("/pricing");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlanDetails();
  }, [planId, router]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-8 hover:bg-primary/10 text-muted-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pricing
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Plan Summary Card */}
        <div className="md:col-span-1">
          <div className="sticky top-24 p-6 rounded-3xl bg-card border border-primary/20 shadow-xl">
            <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
              <Zap className="text-primary w-6 h-6 fill-current" />
            </div>
            <h1 className="text-2xl font-bold">{plan.name}</h1>
            <p className="text-muted-foreground text-sm mt-2">
              {plan.description}
            </p>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">${plan.priceMonthly}</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
              <p className="text-xs text-primary font-medium mt-1">
                or ${plan.priceYearly}/year (Save 20%)
              </p>
            </div>

            <Button className="w-full mt-8 h-12 rounded-xl font-bold shadow-lg shadow-primary/20">
              Select This Plan
            </Button>

            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" /> Secure Checkout
            </div>
          </div>
        </div>

        {/* Full Feature List */}
        <div className="md:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              What&apos;s included in {plan.name}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {plan.features?.map((feature) => (
                <div
                  key={feature.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/10 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm font-medium">{feature.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
            <h3 className="font-bold text-sm mb-2">Need more customization?</h3>
            <p className="text-sm text-muted-foreground">
              Contact our sales team for custom enterprise solutions and volume
              discounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
