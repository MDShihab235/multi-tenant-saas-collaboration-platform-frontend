"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./ModeToggle";
import { Button } from "@/components/ui/button";
import { Zap, Menu, LogOut, LayoutDashboard } from "lucide-react";
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
import { NotificationPanel } from "@/components/module/notification/NotificationPanel";
import { authClient } from "@/lib/auth-client"; // 👈 Ensure this path matches your project

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();

  // --- AUTH STATE (DYNAMIC) ---
  const { data: session, isPending: isAuthLoading } = authClient.useSession();
  const user = session?.user;

  const [unreadCount, setUnreadCount] = useState(0);
  const [loginChecked, setLoginChecked] = useState(false);

  // --- 1. RESILIENT NOTIFICATION SYNC ---
  useEffect(() => {
    // 1. Do nothing if there is no user
    if (!user) return;

    // 2. Define the async fetch function inside the effect
    const fetchUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (err) {
        console.warn("Notifications temporarily unavailable.");
      }
    };

    // 3. Initial fetch on mount
    fetchUnreadCount();

    // 4. Set up the polling interval
    const interval = setInterval(fetchUnreadCount, 30000);

    // 5. Cleanup the interval when the component unmounts
    return () => clearInterval(interval);
  }, [user]);

  const handleNotificationsRead = () => {
    setUnreadCount(0);
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

          <div className="hidden md:flex items-center gap-3">
            {/* Show nothing or a skeleton while checking auth */}
            {!isAuthLoading &&
              (user ? (
                <>
                  <NotificationPanel
                    unreadCount={unreadCount}
                    onReadOne={handleNotificationsRead}
                  />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-9 w-9 rounded-full border border-primary/10 p-0"
                      >
                        <Avatar className="h-full w-full">
                          <AvatarImage src={user.image || ""} alt={user.name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {user.name?.charAt(0)}
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
                // 🔐 LOGIN / REGISTER BUTTONS
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="font-semibold">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      size="sm"
                      className="rounded-full px-6 font-bold shadow-md shadow-primary/20"
                    >
                      Sign Up
                    </Button>
                  </Link>

                  <div>
                    <Logout />
                  </div>
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
                      <>
                        <Link href="/login" className="w-full">
                          <Button
                            variant="outline"
                            className="w-full h-12 rounded-2xl"
                          >
                            Log In
                          </Button>
                        </Link>
                        <Link href="/register" className="w-full">
                          <Button className="w-full h-12 rounded-2xl">
                            Sign Up
                          </Button>
                        </Link>
                      </>
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
