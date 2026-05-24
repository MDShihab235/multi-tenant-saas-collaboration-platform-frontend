"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  organizationService,
  OrganizationStats,
} from "@/services/organization.service";
import {
  subscriptionService,
  Subscription,
} from "@/services/subscription.service";
import {
  Users,
  FolderKanban,
  CheckSquare,
  Key,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function OrganizationOverview() {
  const { orgId } = useParams();
  const router = useRouter();
  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!orgId) return;
      try {
        const [statsData, subData] = await Promise.all([
          organizationService.getOrganizationStats(orgId as string),
          subscriptionService.getSubscription(orgId as string),
        ]);
        setStats(statsData);
        setSubscription(subData);
      } catch (error) {
        console.error("Loading Error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [orgId]);

  if (loading) {
    return (
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-3xl" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Members",
      value: stats?.members,
      icon: Users,
      color: "text-blue-500",
    },
    {
      label: "Active Projects",
      value: stats?.projects,
      icon: FolderKanban,
      color: "text-purple-500",
    },
    {
      label: "Completed Tasks",
      value: stats?.tasks,
      icon: CheckSquare,
      color: "text-green-500",
    },
    {
      label: "Active API Keys",
      value: stats?.activeApiKeys,
      icon: Key,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Workspace Overview
          </h1>
          <p className="text-muted-foreground italic">
            Health and activity for /{orgId}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Card
            key={card.label}
            className="rounded-3xl border-none shadow-sm bg-card/50 backdrop-blur-sm ring-1 ring-border"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" /> +4% this month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscription Summary Banner */}
      <div className="bg-primary/5 rounded-3xl p-8 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-primary/10 p-4 rounded-2xl">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">
              Current Plan: {subscription?.plan?.name || "Free Tier"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Your subscription is{" "}
              <span
                className={cn(
                  "font-bold uppercase",
                  subscription?.status === "ACTIVE"
                    ? "text-green-600"
                    : "text-orange-500",
                )}
              >
                {subscription?.status || "NO ACTIVE PLAN"}
              </span>
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/${orgId}/billing/pricing`)}
          className="rounded-xl font-bold px-8 cursor-pointer"
        >
          {subscription ? "Manage Plan" : "Upgrade Plan"}
        </Button>
      </div>
    </div>
  );
}
