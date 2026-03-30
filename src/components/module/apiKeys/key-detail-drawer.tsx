"use client";

import { useEffect, useState } from "react";
import { apiKeyService, ApiKey } from "@/services/api-key.service";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Activity,
  ShieldCheck,
  Trash2,
  RefreshCw,
  Key,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export function KeyDetailDrawer({
  keyId,
  orgId,
  isOpen,
  onClose,
}: {
  keyId: string | null;
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [key, setKey] = useState<ApiKey | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && keyId) {
      const fetchDetail = async () => {
        setIsLoading(true);
        try {
          const data = await apiKeyService.getKeyDetail(orgId, keyId);
          setKey(data);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetail();
    }
  }, [isOpen, keyId, orgId]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[480px] border-l-4 p-0 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin text-primary/20" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
              Polling Security Metadata...
            </p>
          </div>
        ) : (
          key && (
            <>
              <SheetHeader className="p-8 border-b bg-muted/5 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="w-4 h-4" strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Credential Dossier
                  </span>
                </div>
                <div>
                  <SheetTitle className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                    {key.name}
                  </SheetTitle>
                  <SheetDescription className="mt-2 flex items-center gap-2 font-mono text-xs font-bold text-muted-foreground bg-muted/30 px-3 py-1 rounded-lg border w-fit">
                    <Key className="w-3 h-3" /> {key.keyPrefix}••••••••••••
                  </SheetDescription>
                </div>
                <Badge
                  variant={key.isActive ? "default" : "secondary"}
                  className="w-fit rounded-xl font-black uppercase text-[9px] tracking-widest px-3 py-1"
                >
                  {key.isActive ? "Operational" : "Revoked"}
                </Badge>
              </SheetHeader>

              <div className="flex-1 p-8 space-y-10">
                {/* USAGE METRICS */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="p-6 rounded-3xl border-2 border-muted bg-muted/5 space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Activity className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Last Transmission
                      </span>
                    </div>
                    <p className="text-xl font-black italic uppercase tracking-tighter">
                      {key.lastUsedAt
                        ? format(new Date(key.lastUsedAt), "PPP p")
                        : "No Activity Detected"}
                    </p>
                  </div>

                  <div className="p-6 rounded-3xl border-2 border-muted bg-muted/5 space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Expiration Protocol
                      </span>
                    </div>
                    <p className="text-xl font-black italic uppercase tracking-tighter">
                      {key.expiresAt
                        ? format(new Date(key.expiresAt), "PPP")
                        : "Permanent Key"}
                    </p>
                  </div>
                </div>

                {/* SECURITY ADVISORY */}
                <div className="p-6 rounded-3xl border-2 border-dashed border-muted text-center space-y-2 opacity-60">
                  <Clock className="w-5 h-5 mx-auto text-muted-foreground" />
                  <p className="text-[9px] font-bold uppercase leading-relaxed tracking-widest">
                    Created {format(new Date(key.createdAt), "PPP")} <br />
                    Internal Reference: {key.id.split("-")[0]}
                  </p>
                </div>
              </div>

              {/* DANGER ACTIONS */}
              <div className="p-8 border-t bg-muted/20 flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1 rounded-2xl h-14 font-black uppercase text-[10px] tracking-widest border-2"
                >
                  Rotate Key
                </Button>
                <Button
                  variant="destructive"
                  className="rounded-2xl h-14 w-14 p-0 shadow-lg shadow-destructive/20"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </>
          )
        )}
      </SheetContent>
    </Sheet>
  );
}
