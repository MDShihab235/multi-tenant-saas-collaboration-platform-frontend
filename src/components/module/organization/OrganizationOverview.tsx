"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  organizationService,
  OrganizationStats,
} from "@/services/organization.service";
import {
  Users,
  FolderKanban,
  CheckSquare,
  Key,
  CreditCard,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrganizationOverview() {
  const { orgSlug } = useParams();
  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock: In your real app, get this from your OrgContext/Zustand
  // where you stored the mapping of slug -> id during initial load.
  const orgId = "UUID_FROM_CONTEXT";

  useEffect(() => {
    const loadStats = async () => {
      if (!orgId) return;
      try {
        const data = await organizationService.getOrganizationStats(orgId);
        setStats(data);
      } catch (error) {
        console.error("Stats Error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Workspace Overview
        </h1>
        <p className="text-muted-foreground italic">
          Current health and activity for /{orgSlug}
        </p>
      </div>

      {/* Metric Cards */}
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
                <TrendingUp className="h-3 w-3 text-green-500" /> +4% from last
                month
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
              Current Plan: {stats?.subscription.planName}
            </h3>
            <p className="text-sm text-muted-foreground">
              Your subscription is{" "}
              <span className="text-green-600 font-bold uppercase">
                {stats?.subscription.status}
              </span>
            </p>
          </div>
        </div>
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
          Upgrade Plan
        </button>
      </div>
    </div>
  );
}
