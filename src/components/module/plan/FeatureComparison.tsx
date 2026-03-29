"use client";

import { useEffect, useState } from "react";
import { planService, PlanFeature } from "@/services/plan.service";
import { Check, Minus, Loader2, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Assuming shadcn/ui tooltip is installed

interface Props {
  planId: string;
  planName: string;
}

export function PlanFeatureList({ planId, planName }: Props) {
  const [features, setFeatures] = useState<PlanFeature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        const data = await planService.getPlanFeatures(planId);
        setFeatures(data);
      } catch (err) {
        console.error("Feature fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadFeatures();
  }, [planId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span>Loading capabilities...</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <h4 className="text-xs font-bold uppercase tracking-widest text-primary">
            {planName} Inclusion
          </h4>
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {features.filter((f) => f.isAvailable).length} Features
          </span>
        </div>

        <ul className="grid grid-cols-1 gap-3">
          {features.map((feature) => (
            <li
              key={feature.id}
              className="group flex items-start gap-3 text-sm transition-colors hover:bg-muted/30 p-1.5 rounded-lg -ml-1.5"
            >
              {/* Availability Icon */}
              <div className="mt-0.5">
                {feature.isAvailable ? (
                  <Check className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <Minus className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                )}
              </div>

              {/* Feature Content */}
              <div className="flex-1 flex items-center gap-2">
                <span
                  className={
                    feature.isAvailable
                      ? "text-foreground font-medium"
                      : "text-muted-foreground line-through opacity-70"
                  }
                >
                  {feature.name}
                  {feature.value && (
                    <span className="ml-1.5 text-primary/80 font-bold">
                      ({feature.value})
                    </span>
                  )}
                </span>

                {/* Description Tooltip */}
                {feature.description && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 outline-none">
                        <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="max-w-50 text-xs bg-popover/90 backdrop-blur-md border-primary/20"
                    >
                      <p>{feature.description}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </TooltipProvider>
  );
}
