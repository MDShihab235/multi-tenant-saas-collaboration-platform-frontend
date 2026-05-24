"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { planService, Plan } from "@/services/plan.service";
import {
  subscriptionService,
  BillingCycle,
} from "@/services/subscription.service";
import { Button } from "@/components/ui/button";
import { Zap, Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanFeatureList } from "./FeatureComparison";
import { toast } from "sonner";

export default function Pricing() {
  const { orgId } = useParams();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("MONTHLY");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await planService.getAllPlans();
        setPlans(data);
      } catch (error) {
        console.error("Fetch plans error:", error);
        toast.error("Failed to load pricing plans");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (!orgId) return toast.error("Organization context missing");

    setIsSubscribing(planId);

    try {
      // 1. Call your backend service
      // The backend (as per our previous setup) returns { url: session.url }
      const response = await subscriptionService.subscribe(orgId as string, {
        planId,
        billingCycle,
      });
      const checkoutUrl = (response as { url?: string }).url;

      // 2. Redirect the user to Stripe's Hosted Checkout page
      if (checkoutUrl) {
        toast.loading("Redirecting to secure checkout...");
        window.location.href = checkoutUrl;
      } else {
        throw new Error("No checkout URL received from server");
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast.error(error.message || "Failed to initiate checkout");
    } finally {
      setIsSubscribing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-3">
          Pricing
        </h2>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Ready to scale your{" "}
          <span className="text-primary">collaboration?</span>
        </h1>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span
            className={cn(
              "text-sm",
              billingCycle === "MONTHLY"
                ? "font-bold"
                : "text-muted-foreground",
            )}
          >
            Monthly
          </span>
          <button
            onClick={() =>
              setBillingCycle((prev) =>
                prev === "MONTHLY" ? "YEARLY" : "MONTHLY",
              )
            }
            className="w-12 h-6 bg-primary/20 rounded-full relative transition-colors"
          >
            <div
              className={cn(
                "absolute top-1 w-4 h-4 bg-primary rounded-full transition-all",
                billingCycle === "YEARLY" ? "left-7" : "left-1",
              )}
            />
          </button>
          <span
            className={cn(
              "text-sm",
              billingCycle === "YEARLY" ? "font-bold" : "text-muted-foreground",
            )}
          >
            Yearly <span className="text-green-500 text-xs">(Save 20%)</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col p-8 rounded-3xl border transition-all duration-300 hover:scale-[1.02]",
              plan.slug === "team-pro" // Example logic for 'Popular' badge
                ? "bg-card border-primary shadow-xl ring-1 ring-primary/50"
                : "bg-background border-border",
            )}
          >
            {plan.slug === "team-pro" && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> MOST POPULAR
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm min-h-10">
                {plan.description || "The perfect plan for your growing team."}
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">
                  $
                  {billingCycle === "MONTHLY"
                    ? plan.priceMonthly
                    : plan.priceYearly}
                </span>
                <span className="text-muted-foreground">
                  /{billingCycle === "MONTHLY" ? "mo" : "yr"}
                </span>
              </div>
            </div>

            <div className="mb-10 flex-1">
              <PlanFeatureList planId={plan.id} planName={plan.name} />
            </div>

            <Button
              onClick={() => handleSubscribe(plan.id)}
              disabled={isSubscribing !== null}
              variant={plan.slug === "team-pro" ? "default" : "outline"}
              className="w-full h-12 font-bold rounded-xl"
            >
              {isSubscribing === plan.id ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <>
                  Get Started <Zap className="ml-2 w-4 h-4 fill-current" />
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
