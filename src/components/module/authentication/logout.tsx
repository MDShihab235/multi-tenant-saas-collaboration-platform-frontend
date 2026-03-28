"use client";

import { useLogout } from "@/hooks/use-logout";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";

export function Logout() {
  const { mutate: logout, isPending } = useLogout();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => logout()}
      disabled={isPending}
      className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer "
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      Logout
    </Button>
  );
}
