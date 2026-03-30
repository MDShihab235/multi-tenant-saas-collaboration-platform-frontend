"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./ModeToggle";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Menu,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logout } from "../module/authentication/logout";
import { notificationService } from "@/services/notification.service";
import { NotificationPanel } from "@/components/module/notification/NotificationPanel"; // New Component

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "About", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();

  // Auth State
  const [user, setUser] = useState<{
    name: string;
    email: string;
    image?: string;
  } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. LIGHTWEIGHT COUNT POLLING ---
  const syncCount = useCallback(async () => {
    if (!user) return;
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Signal lost: Notification sync failed.");
    }
  }, [user]);

  useEffect(() => {
    // Mocking session - Replace with your actual useAuth() hook logic
    const session = { name: "John Doe", email: "john@example.com" };
    setUser(session);
    setIsLoading(false);

    if (session) {
      syncCount();
      const interval = setInterval(syncCount, 30000); // 30s lightweight check
      return () => clearInterval(interval);
    }
  }, [syncCount]);

  // --- 2. OPTIMISTIC CLEAR ---
  const handleNotificationsRead = () => {
    setUnreadCount(0); // Instantly clear badge on panel interaction
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-1.5 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
            <Zap className="w-5 h-5 text-primary-foreground fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight">Collab Pro</span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* ACTION ZONE */}
        <div className="flex items-center gap-3">
          <ModeToggle />

          {/* DESKTOP AUTHENTICATED UI */}
          <div className="hidden md:flex items-center gap-3">
            {!isLoading &&
              (user ? (
                <>
                  {/* LIVE NOTIFICATION PANEL */}
                  <NotificationPanel
                    unreadCount={unreadCount}
                    onReadOne={handleNotificationsRead}
                  />

                  {/* PROFILE DROPDOWN */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-9 w-9 rounded-full border border-primary/10 p-0"
                      >
                        <Avatar className="h-full w-full">
                          <AvatarImage src={user.image} alt={user.name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 mt-2 rounded-xl p-2 border-2 shadow-xl"
                    >
                      <DropdownMenuLabel className="font-normal px-2 py-3">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-bold leading-none">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard"
                          className="cursor-pointer gap-2 py-2.5"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="p-0 focus:bg-transparent">
                        <Logout className="w-full flex justify-start px-2 py-2.5 text-destructive font-semibold gap-2 rounded-lg hover:bg-destructive/10">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </Logout>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="font-semibold">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="rounded-full px-6 font-bold">
                      Get Started
                    </Button>
                  </Link>
                </>
              ))}
          </div>

          {/* MOBILE MENU */}
          <div className="md:hidden flex items-center gap-2">
            {user && unreadCount > 0 && (
              <div className="w-2 h-2 rounded-full bg-destructive animate-pulse mr-1" />
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85%] sm:w-[400px]">
                <nav className="flex flex-col gap-6 mt-12">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-2xl font-bold"
                    >
                      {link.name}
                    </Link>
                  ))}
                  <div className="flex flex-col gap-3 mt-8 pt-8 border-t border-dashed">
                    {user ? (
                      <Link href="/dashboard" className="w-full">
                        <Button className="w-full h-12 rounded-2xl font-bold">
                          Dashboard
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/login" className="w-full">
                        <Button
                          variant="outline"
                          className="w-full h-12 rounded-2xl"
                        >
                          Log in
                        </Button>
                      </Link>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
