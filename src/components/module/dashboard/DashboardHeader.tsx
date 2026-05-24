"use client";

import { useOrgStore } from "@/store/useOrgStore";
import { ModeToggle } from "@/components/shared/ModeToggle";
import { Button } from "@/components/ui/button";
import { Bell, Search, Plus, CheckCheck } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
// import { useLogout } from "@/hooks/use-logout";
import {
  notificationService,
  Notification,
} from "@/services/notification.service";
import { Badge } from "@/components/ui/badge";
import { Logout } from "../authentication/logout";

export default function DashboardHeader() {
  const { user, fetchAuthMe, isAuthenticated } = useAuth();
  const { activeOrgSlug } = useOrgStore();
  // const logout = useLogout();

  // --- Notification State ---
  const [unreadNotifications, setUnreadNotifications] = useState<
    Notification[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      fetchAuthMe();
    }
  }, [fetchAuthMe, isAuthenticated]);

  // Fetch Notifications on Mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await notificationService.getUnread();
        // Assuming your service returns { data: Notification[], unreadCount: number }
        setUnreadNotifications(response.data || []);
        setUnreadCount(response.unreadCount || 0);
      } catch (error) {
        console.error("Failed to load notifications", error);
      }
    };

    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setUnreadNotifications([]);
    setUnreadCount(0);
  };

  const getInitials = (name?: string) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "S";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="hidden md:flex relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects, tasks, or files..."
            className="w-full bg-muted/50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-4">
          {activeOrgSlug && (
            <Link href={`/${activeOrgSlug}/projects/create`}>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex rounded-full gap-2 border-primary/20"
              >
                <Plus className="h-4 w-4 text-primary" />
                New Project
              </Button>
            </Link>
          )}

          <div className="h-8 w-px bg-border mx-1" />

          {/* --- Notifications Dropdown --- */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors outline-none">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-destructive text-[10px] text-white font-bold flex items-center justify-center rounded-full border-2 border-background">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 mt-2 rounded-xl p-0"
            >
              <div className="flex items-center justify-between p-4">
                <DropdownMenuLabel className="p-0">
                  Notifications
                </DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-[10px] h-7 px-2 gap-1 text-primary"
                    onClick={handleMarkAllRead}
                  >
                    <CheckCheck className="h-3 w-3" /> Mark all read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator className="m-0" />

              <div className="max-h-75 overflow-y-auto">
                {unreadNotifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    All caught up! No new alerts.
                  </div>
                ) : (
                  unreadNotifications.map((notif) => (
                    <DropdownMenuItem
                      key={notif.id}
                      className="p-4 cursor-pointer focus:bg-muted/50 border-b last:border-0"
                    >
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm font-semibold leading-none">
                            {notif.title}
                          </p>
                          <Badge
                            variant="outline"
                            className="text-[9px] uppercase px-1 py-0"
                          >
                            {notif.type.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notif.body}
                        </p>
                        <span className="text-[10px] text-primary/60 mt-1">
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>

              <DropdownMenuSeparator className="m-0" />
              <Link href="/dashboard/notifications" className="block w-full">
                <Button
                  variant="ghost"
                  className="w-full rounded-t-none text-xs text-muted-foreground hover:text-primary"
                >
                  View all history
                </Button>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

          <ModeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="h-9 w-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center cursor-pointer hover:ring-2 ring-primary/20 transition-all">
                <span className="text-xs font-bold text-primary">
                  {getInitials(user?.name)}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings/profile">Profile Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/organizations/create">
                  Create Organization
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Logout />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
