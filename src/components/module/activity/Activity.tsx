"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  activityService,
  ActivityLog,
  ActivityFilter,
} from "@/services/activity.service";
import {
  History,
  Search,
  User,
  Calendar,
  FilterX,
  Loader2,
  ArrowDownCircle,
  SlidersHorizontal,
  ShieldCheck,
  LayoutList,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ActivityItem } from "./ActivityItem"; // Custom row component
import { ActivityDetailDrawer } from "./acitivity-detail-drawer";

export default function ActivityPage() {
  // --- STATE MANAGEMENT ---
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Drawer State
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filter State
  const [filters, setFilters] = useState<ActivityFilter>({
    actorId: "",
    action: "",
    from: undefined,
    to: undefined,
  });

  const currentOrgId = "org_12345"; // Context-driven in production

  // --- DATA FETCHING ---
  const syncLogs = useCallback(
    async (
      pageNum: number,
      currentFilters: ActivityFilter,
      isInitial = false,
    ) => {
      if (isInitial) setIsLoading(true);
      try {
        const { data, meta } = await activityService.filterLogs(
          currentOrgId,
          currentFilters,
          pageNum,
        );
        setLogs((prev) => (isInitial ? data : [...prev, ...data]));
        setHasMore(meta.currentPage < meta.totalPages);
      } catch (error) {
        console.error("Ledger Sync Error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentOrgId],
  );

  // Sync on filter change
  useEffect(() => {
    setPage(1);
    syncLogs(1, filters, true);
  }, [filters, syncLogs]);

  // --- HANDLERS ---
  const handleOpenDetail = (id: string) => {
    setSelectedLogId(id);
    setIsDrawerOpen(true);
  };

  const resetFilters = () =>
    setFilters({ actorId: "", action: "", from: undefined, to: undefined });

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-10 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-muted pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="w-5 h-5" strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">
              Operational Security Ledger
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase leading-none">
            Audit Trail
          </h1>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground font-bold text-sm bg-muted/30 px-4 py-2 rounded-2xl border">
            {logs.length} Operations Indexed
          </p>
        </div>
      </div>

      {/* TACTICAL FILTER BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-card border-4 border-muted rounded-[2.5rem] shadow-xl shadow-black/5">
        {/* Action Keyword */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search action..."
            className="pl-11 rounded-2xl border-2 border-muted bg-background h-12 text-xs font-bold uppercase tracking-widest focus:border-primary/50 transition-all"
            value={filters.action}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, action: e.target.value }))
            }
          />
        </div>

        {/* Actor Filter */}
        <Select
          value={filters.actorId}
          onValueChange={(val) =>
            setFilters((prev) => ({ ...prev, actorId: val }))
          }
        >
          <SelectTrigger className="rounded-2xl border-2 border-muted bg-background h-12 text-xs font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <SelectValue placeholder="Filter Actor" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-2 shadow-2xl">
            <SelectItem value="system" className="font-bold">
              System Agent
            </SelectItem>
            <SelectItem value="user_1" className="font-bold">
              John Doe
            </SelectItem>
            <SelectItem value="user_2" className="font-bold">
              Jane Smith
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-start text-left rounded-2xl border-2 border-muted bg-background h-12 text-xs font-bold uppercase tracking-widest px-4"
            >
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              {filters.from
                ? format(new Date(filters.from), "MMM dd")
                : "From"}{" "}
              - {filters.to ? format(new Date(filters.to), "MMM dd") : "To"}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 rounded-[2rem] border-4 shadow-3xl"
            align="start"
          >
            <CalendarComponent
              initialFocus
              mode="range"
              selected={{
                from: filters.from ? new Date(filters.from) : undefined,
                to: filters.to ? new Date(filters.to) : undefined,
              }}
              onSelect={(range) =>
                setFilters((prev) => ({
                  ...prev,
                  from: range?.from?.toISOString(),
                  to: range?.to?.toISOString(),
                }))
              }
            />
          </PopoverContent>
        </Popover>

        {/* Global Controls */}
        <div className="flex gap-2">
          <Button
            onClick={resetFilters}
            variant="ghost"
            className="flex-1 rounded-2xl h-12 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-destructive/10 hover:text-destructive border-2 border-transparent hover:border-destructive/20"
          >
            <FilterX className="w-4 h-4 mr-2" /> Reset
          </Button>
        </div>
      </div>

      {/* THE FEED */}
      <div className="space-y-4 relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/50 backdrop-blur-sm z-10 rounded-[3rem]">
            <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">
              Decrypting Operations...
            </p>
          </div>
        ) : logs.length > 0 ? (
          <>
            <div className="grid gap-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => handleOpenDetail(log.id)}
                  className="cursor-pointer"
                >
                  <ActivityItem log={log} />
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="pt-12 flex justify-center">
                <Button
                  onClick={() => {
                    setPage((p) => p + 1);
                    syncLogs(page + 1, filters);
                  }}
                  className="rounded-[2rem] h-16 px-16 border-4 font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-primary hover:text-white transition-all active:scale-95"
                >
                  <ArrowDownCircle className="w-4 h-4 mr-2" /> Retrieve Older
                  Intel
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="h-96 rounded-[4rem] border-8 border-dotted border-muted flex flex-col items-center justify-center text-center p-12 opacity-30 grayscale transition-all hover:grayscale-0 hover:opacity-100 group">
            <SlidersHorizontal
              className="w-16 h-16 mb-6 group-hover:rotate-180 transition-transform duration-700"
              strokeWidth={1}
            />
            <h3 className="text-3xl font-black uppercase italic tracking-tighter">
              No Matching Intel
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] mt-3">
              Adjust operational parameters to broaden search
            </p>
          </div>
        )}
      </div>

      {/* METADATA INSPECTOR DRAWER */}
      <ActivityDetailDrawer
        logId={selectedLogId}
        orgId={currentOrgId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
