"use client";

import { useEffect, useState, useCallback } from "react";
import {
  notificationService,
  Notification,
} from "@/services/notification.service";
import {
  Bell,
  Inbox,
  Loader2,
  CheckCheck,
  Trash2,
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  Calendar,
  InboxIcon,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // --- 1. DATA INITIALIZATION ---
  const fetchHistory = useCallback(
    async (pageNum: number, isInitial = false) => {
      if (isInitial) setIsLoading(true);
      try {
        const { data, meta } = await notificationService.getNotifications(
          pageNum,
          15,
        );
        setNotifications((prev) => (isInitial ? data : [...prev, ...data]));
        setHasMore(meta.currentPage < meta.totalPages);
      } catch (err) {
        toast.error("Archive sync failed. Connection unstable.");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchHistory(1, true);
  }, [fetchHistory]);

  // --- 2. SINGLE ITEM ACTIONS ---
  const handleMarkRead = async (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)),
    );
    try {
      await notificationService.markAsRead(notifId);
    } catch {
      fetchHistory(1, true); // Rollback by refetching
    }
  };

  const handleDelete = async (notifId: string) => {
    const backup = [...notifications];
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    try {
      await notificationService.deleteNotification(notifId);
      toast.info("Log entry redacted.");
    } catch {
      setNotifications(backup);
      toast.error("Redaction failed.");
    }
  };

  // --- 3. BULK ACTIONS ---
  const handleMarkAllRead = async () => {
    const backup = [...notifications];
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await notificationService.markAllAsRead();
      toast.success("Intelligence feed processed.");
    } catch {
      setNotifications(backup);
    }
  };

  const handleClearAll = async () => {
    setIsProcessing(true);
    try {
      await notificationService.clearAll();
      setNotifications([]);
      toast.success("Database purged successfully.");
    } catch {
      toast.error("Purge interrupted.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center font-black animate-pulse uppercase tracking-[0.4em] text-xs">
        Querying Intelligence Archive...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER: COMMAND STRIP */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b-4 border-muted pb-12">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-primary">
            <Bell className="w-6 h-6" strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.6em]">
              Sector 7G // Logs
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase leading-none">
            Intelligence Feed
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={handleMarkAllRead}
            className="rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest border-2"
          >
            <CheckCheck className="w-4 h-4 mr-2" /> Mark All Read
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Purge History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem] border-4 p-8">
              <AlertDialogHeader>
                <div className="flex items-center gap-4 text-destructive mb-4">
                  <ShieldAlert className="w-10 h-10" />
                  <AlertDialogTitle className="text-3xl font-black uppercase italic tracking-tighter">
                    Confirm Data Wipe
                  </AlertDialogTitle>
                </div>
                <AlertDialogDescription className="text-base font-medium text-muted-foreground leading-relaxed">
                  This protocol will permanently delete **all** historical
                  mission logs. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-8">
                <AlertDialogCancel className="rounded-xl font-black uppercase text-[10px]">
                  Abort
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAll}
                  className="rounded-xl bg-destructive font-black uppercase text-[10px] px-8"
                >
                  Confirm Purge
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* FEED: LOG ENTRIES */}
      <div className="grid gap-6">
        {notifications.length > 0 ? (
          <>
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "group relative flex flex-col md:flex-row md:items-center gap-6 p-8 rounded-[3rem] border-4 transition-all duration-300",
                  n.isRead
                    ? "bg-muted/5 border-transparent grayscale-[0.8] opacity-50"
                    : "bg-card border-muted hover:border-primary/40 shadow-2xl shadow-primary/5",
                )}
              >
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className="rounded-lg font-black text-[9px] uppercase tracking-tighter py-1 px-3">
                      {n.type}
                    </Badge>
                    <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase">
                      <Calendar className="w-3 h-3" />{" "}
                      {formatDistanceToNow(new Date(n.createdAt))} ago
                    </span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight uppercase leading-tight group-hover:text-primary transition-colors">
                    {n.title}
                  </h3>
                  <p className="text-muted-foreground font-medium text-base line-clamp-1 italic max-w-3xl">
                    {n.body}
                  </p>
                </div>

                <div className="flex items-center gap-3 md:opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                  {!n.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkRead(n.id)}
                      className="rounded-xl font-black text-[9px] uppercase tracking-widest border-2 h-10"
                    >
                      Acknowledge
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(n.id)}
                    className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  <Link href={n.link || "#"}>
                    <Button
                      size="icon"
                      className="h-10 w-10 rounded-xl shadow-lg shadow-primary/20"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="pt-12 flex justify-center">
                <Button
                  onClick={() => {
                    setPage((p) => p + 1);
                    fetchHistory(page + 1);
                  }}
                  variant="outline"
                  className="rounded-2xl h-14 px-12 border-4 font-black uppercase text-xs tracking-[0.2em] hover:bg-primary hover:text-white transition-all shadow-2xl shadow-primary/10"
                >
                  Load Older Intel
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="h-[500px] border-8 border-dashed border-muted rounded-[5rem] flex flex-col items-center justify-center text-center p-12 space-y-6">
            <div className="p-10 bg-muted/20 rounded-full animate-pulse">
              <InboxIcon
                className="w-16 h-16 text-muted-foreground/20"
                strokeWidth={1}
              />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-black italic uppercase tracking-tighter">
                Sector is Dark
              </p>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em]">
                No active mission logs in current archive
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => fetchHistory(1, true)}
              className="rounded-xl border-2 font-black uppercase text-[10px] tracking-widest mt-4"
            >
              <RefreshCw className="w-3 h-3 mr-2" /> Force Re-Sync
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
