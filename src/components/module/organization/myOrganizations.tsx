"use client";

import { useEffect, useState } from "react";
import { organizationService } from "@/services/organization.service";
import type { MyOrganization } from "@/services/organization.service";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Building2,
  Loader2,
  LayoutDashboard,
  Users,
  FolderKanban,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyOrganization() {
  // Renamed to avoid conflict with Type
  const [orgs, setOrgs] = useState<MyOrganization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const data = await organizationService.getMyOrganizations();
        setOrgs(data);
      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally {
        setLoading(false);
      }
    };
    initDashboard();
  }, []);
  const router = useRouter();
  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (orgs.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="bg-muted p-6 rounded-full">
          <Building2 className="w-12 h-12 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">No workspaces found</h2>
          <p className="text-muted-foreground">
            Create your first organization to start collaborating.
          </p>
        </div>
        <Button asChild>
          <Link href="/organizations/create">
            <Plus className="mr-2 h-4 w-4" /> Create Organization
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <LayoutDashboard className="text-primary" /> Your Workspaces
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/organization/create">
            <Plus className="mr-2 h-4 w-4" /> New Org
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orgs.map((org) => {
          // 1. Extract Role Safely
          const userRole = org.memberships?.[0]?.role;
          const displayRole =
            typeof userRole === "string" ? userRole : "Member";

          // 2. Extract Plan Name Safely
          // This is where the error {id, name} usually hides
          const planName = org.subscription?.plan?.name;
          const displayPlan = typeof planName === "string" ? planName : null;

          const handleCardClick = () => {
            router.push(`/${org.id}/overview`);
          };

          return (
            <div
              key={org.id}
              onClick={handleCardClick}
              className="group block p-6 bg-card border rounded-3xl hover:border-primary/50 transition-all hover:shadow-lg max-w-fit cursor-pointer max-h-fit"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-primary/10 p-3 rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-muted px-2 py-1 rounded-md text-muted-foreground">
                  {displayRole}
                </span>
              </div>

              <h3 className="text-xl font-bold mb-1">{org.name}</h3>
              <p className="text-xs text-muted-foreground font-mono mb-4">
                /{org.slug}
              </p>

              <div className="flex flex-col items-center gap-4 border-t pt-4 ">
                <div className="flex gap-2 items-start">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{Number(org._count?.members || 0)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <FolderKanban className="w-4 h-4" />
                    <span>{Number(org._count?.projects || 0)}</span>
                  </div>
                </div>
                <div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    <Link href={`/${org.id}/overview`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Overview
                    </Link>
                  </Button>

                  {displayPlan ? (
                    <div className="ml-auto text-[10px] font-bold text-primary">
                      {displayPlan}
                    </div>
                  ) : (
                    <div className="ml-auto text-[10px] font-bold text-primary">
                      Plan
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
