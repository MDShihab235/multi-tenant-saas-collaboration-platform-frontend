"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  notificationService,
  Notification,
} from "@/services/notification.service";
import { Bell, Inbox, Loader2, Circle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function NotificationPanel({
  unreadCount,
  onReadOne,
}: {
  unreadCount: number;
  onReadOne: () => void;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const { data } = await notificationService.getUnread();
      setNotifications(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = async (notif: Notification) => {
    // 1. Optimistic UI: Dim the item and decrement parent count
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    onReadOne();

    // 2. Background Sync
    try {
      await notificationService.markAsRead(notif.id);
    } catch (err) {
      console.error("Acknowledgment failed, but proceeding to link.");
    }

    // 3. Navigation
    if (notif.link) {
      router.push(notif.link);
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && fetchNotifications()}>
      <DropdownMenuTrigger asChild>
        <div className="relative cursor-pointer group">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full group-hover:bg-primary/5 transition-all"
          >
            <Bell
              className={cn(
                "w-5 h-5 transition-colors",
                unreadCount > 0 ? "text-primary" : "text-muted-foreground",
              )}
            />
          </Button>
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-3 w-3 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-white ring-2 ring-background animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[380px] p-0 rounded-2xl shadow-3xl border-2"
      >
        <div className="p-4 border-b bg-muted/10 flex items-center justify-between">
          <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-primary/70">
            Tactical Alerts
          </h3>
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full p-12 space-y-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary/30" />
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-muted/30">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className="p-4 hover:bg-muted/40 cursor-pointer transition-all flex gap-4 items-start group"
                >
                  <Circle className="w-2 h-2 mt-1.5 fill-primary text-primary shrink-0 group-hover:scale-125 transition-transform" />
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-tight">
                      {n.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                      {n.body}
                    </p>
                    <p className="text-[9px] font-bold text-muted-foreground/50 uppercase mt-2">
                      {formatDistanceToNow(new Date(n.createdAt))} ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-center p-8 opacity-40">
              <Inbox className="w-8 h-8 mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                Sector Clear
              </p>
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t bg-muted/5">
          <Button
            variant="ghost"
            className="w-full text-[9px] font-black uppercase h-8"
            onClick={() => router.push("/notifications")}
          >
            Full Archive
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
