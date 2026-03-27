// src/components/shared/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./ModeToggle";
import { Button } from "@/components/ui/button";
import { Zap, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "About", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isAuthPage =
    pathname.includes("/login") || pathname.includes("/register");

  // This would typically come from your useAuth hook
  const user = null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
            <Zap className="w-5 h-5 text-primary-foreground fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight">Nova</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <ModeToggle />

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-full px-5"
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="rounded-full px-5">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-semibold border-b pb-2"
                    >
                      {link.name}
                    </Link>
                  ))}
                  <div className="flex flex-col gap-3 mt-4">
                    <Link href="/login" className="w-full">
                      <Button variant="outline" className="w-full">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/register" className="w-full">
                      <Button className="w-full">Get Started</Button>
                    </Link>
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
