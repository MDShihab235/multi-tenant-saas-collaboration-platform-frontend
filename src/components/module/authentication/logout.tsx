"use client";

import { useLogout } from "@/hooks/use-logout";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoutProps {
  className?: string;
  variant?: "ghost" | "default" | "outline" | "destructive";
  children?: React.ReactNode;
}

export function Logout({
  className,
  variant = "ghost",
  children,
}: LogoutProps) {
  const { mutate: logout, isPending } = useLogout();

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={(e) => {
        // Prevent dropdown or parent link clicks from triggering
        e.stopPropagation();
        logout();
      }}
      disabled={isPending}
      className={cn(
        "text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer w-full justify-start font-semibold",
        className,
      )}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      {children || "Logout"}
    </Button>
  );
}
