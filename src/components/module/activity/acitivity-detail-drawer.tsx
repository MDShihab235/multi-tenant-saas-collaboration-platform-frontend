"use client";

import { useState, useEffect } from "react";
import {
  activityService,
  ActivityLogDetail,
} from "@/services/activity.service";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code2, Cpu, User, Clock, HardDrive } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export function ActivityDetailDrawer({
  logId,
  orgId,
  isOpen,
  onClose,
}: {
  logId: string | null;
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<ActivityLogDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && logId) {
      const fetchDetail = async () => {
        setIsLoading(true);
        try {
          const data = await activityService.getLogDetail(orgId, logId);
          setDetail(data);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetail();
    }
  }, [isOpen, logId, orgId]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[540px] border-l-4 p-0 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <Cpu className="w-10 h-10 animate-pulse text-primary/20" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
              Decrypting Metadata...
            </p>
          </div>
        ) : (
          detail && (
            <>
              <SheetHeader className="p-8 border-b bg-muted/5">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <HardDrive className="w-4 h-4" strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Event ID: {detail.id.slice(-8)}
                  </span>
                </div>
                <SheetTitle className="text-3xl font-black italic uppercase tracking-tighter">
                  {detail.action.replace("_", " ")}
                </SheetTitle>
                <SheetDescription className="text-sm font-bold text-muted-foreground uppercase tracking-tight">
                  {detail.entityName}
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="flex-1 p-8">
                <div className="space-y-8">
                  {/* ACTOR & TIME */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" /> Originator
                      </p>
                      <p className="text-sm font-bold">{detail.actor.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Timestamp
                      </p>
                      <p className="text-sm font-bold">
                        {format(new Date(detail.createdAt), "PPpp")}
                      </p>
                    </div>
                  </div>

                  {/* METADATA JSON INSPECTOR */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 flex items-center gap-2">
                        <Code2 className="w-4 h-4" /> Raw Payload
                      </p>
                      <Badge
                        variant="outline"
                        className="rounded-lg text-[9px] font-black uppercase"
                      >
                        JSON_VIEW
                      </Badge>
                    </div>

                    <div className="rounded-2xl bg-zinc-950 p-6 overflow-hidden border-2 border-white/5 shadow-2xl">
                      <pre className="text-[11px] font-mono leading-relaxed text-emerald-400/90 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(detail.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-6 border-t bg-muted/20">
                <Button
                  onClick={onClose}
                  className="w-full rounded-xl h-12 font-black uppercase text-[10px] tracking-widest"
                >
                  Close Inspector
                </Button>
              </div>
            </>
          )
        )}
      </SheetContent>
    </Sheet>
  );
}
