"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  Building,
  Zap,
  MessageSquare,
  FolderKanban,
  Building2,
  House,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/", icon: House },
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Organizations", href: "/overview", icon: Building2 },
  {
    name: "Create Organization",
    href: "/dashboard/organizations/create",
    icon: Building,
  },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Workflows", href: "/dashboard/workflows", icon: Zap },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full py-6">
      {/* Brand Logo */}
      <div className="px-6 mb-10">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="bg-primary p-1.5 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Zap className="w-5 h-5 text-primary-foreground fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Collab <span className="text-primary">Pro</span>
          </span>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary shadow-[inset_0_0_10px_rgba(168,85,247,0.1)]"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 transition-colors",
                  isActive ? "text-primary" : "group-hover:text-foreground",
                )}
              />
              {item.name}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_#a855f7]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Workspace Switcher Placeholder (Bottom) */}
      <div className="px-3 mt-auto">
        <div className="bg-muted/50 rounded-2xl p-4 border border-border/50">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">
            Current Workspace
          </p>
          <div className="flex items-center gap-3 px-1">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xs font-bold text-white">
              AC
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-foreground">
                Acme Corp
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                Free Plan
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
