import { ModeToggle } from "@/components/shared/ModeToggle";
import { Button } from "@/components/ui/button";
import { Bell, Search, Plus } from "lucide-react";

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Search Bar */}
        <div className="hidden md:flex relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects, tasks, or files..."
            className="w-full bg-muted/50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex rounded-full gap-2 border-primary/20 hover:bg-primary/5"
          >
            <Plus className="h-4 w-4 text-primary" />
            New Project
          </Button>

          <div className="h-8 w-px bg-border mx-1" />

          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
          </button>

          <ModeToggle />

          {/* User Avatar Placeholder */}
          <div className="h-9 w-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center cursor-pointer hover:ring-2 ring-primary/20 transition-all">
            <span className="text-xs font-bold text-primary">JD</span>
          </div>
        </div>
      </div>
    </header>
  );
}
