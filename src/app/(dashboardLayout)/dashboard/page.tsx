import React from "react";
import MyOrganization from "@/components/module/organization/myOrganizations";
import { MyProjectsWidget } from "@/components/module/dashboard/MyProjectWidget";
import { LayoutDashboard, Sparkles } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="p-6 md:p-10 max-w-400 mx-auto space-y-10">
      {/* 1. Welcoming Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <LayoutDashboard className="w-10 h-10 text-primary" />
          Workspace Overview
        </h1>
        <p className="text-muted-foreground flex items-center gap-2 font-medium">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Welcome back! Here is what is happening across your organizations.
        </p>
      </div>

      {/* 2. Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Organization Management (Takes more space) */}
        <div className="xl:col-span-8 space-y-8">
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-bold">Your Organizations</h2>
              <p className="text-sm text-muted-foreground">
                Quick access to your workspaces.
              </p>
            </div>
            <MyOrganization />
          </section>
        </div>

        {/* Right Column: Project Activity Sidebar */}
        <div className="xl:col-span-4 space-y-8">
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-bold">Active Projects</h2>
              <p className="text-sm text-muted-foreground">
                Direct links to your ongoing work.
              </p>
            </div>
            <MyProjectsWidget />
          </section>

          {/* Optional: Add a 'Quick Actions' card here later */}
          <div className="p-6 bg-primary/5 border border-primary/10 rounded-[2rem] space-y-3">
            <h3 className="font-bold text-sm text-primary">Pro Tip</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You can switch between organizations using the sidebar or the
              &quot;My Organizations&quot; list to see specific team metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
