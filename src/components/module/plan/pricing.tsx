"use client";

import { useEffect, useState } from "react";
import { planService, Plan } from "@/services/plan.service";
import { Button } from "@/components/ui/button";
import { Check, Zap, Loader2, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic"; // Import dynamic
// Load FeatureComparison dynamically with SSR disabled
const PlanFeatureList = dynamic(
  () => import("./FeatureComparison").then((mod) => mod.PlanFeatureList),
  {
    ssr: false,
    loading: () => (
      <div className="h-20 flex items-center">
        <Loader2 className="animate-spin w-4 h-4" />
      </div>
    ),
  },
);

export default function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await planService.getAllPlans();
        setPlans(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

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
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Choose a plan that fits your team&apos;s needs. From solo creators to
          large enterprises, we&apos;ve got you covered.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col p-8 rounded-3xl border transition-all duration-300 hover:scale-[1.02]",
              plan.isPopular
                ? "bg-card border-primary shadow-[0_0_40px_rgba(168,85,247,0.15)] ring-1 ring-primary/50"
                : "bg-background border-border",
            )}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> MOST POPULAR
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm min-h-10">
                {plan.description}
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </div>
            </div>

            {/* --- FEATURE COMPARISON COMPONENT PLACEMENT --- */}
            <div className="mb-10 flex-1 overflow-hidden">
              <PlanFeatureList planId={plan.id} planName={plan.name} />
            </div>
            {/* ---------------------------------------------- */}

            <Button
              asChild
              variant={plan.isPopular ? "default" : "outline"}
              className="w-full h-12 font-bold rounded-xl cursor-pointer"
            >
              <Link href={`/admin/plans/${plan.id}`}>
                Get Started <Zap className="ml-2 w-4 h-4 fill-current" />
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
