"use client";

import { useEffect, useState, useCallback } from "react";
import { apiKeyService, ApiKey } from "@/services/api-key.service";
import {
  Key,
  ShieldCheck,
  Copy,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Clock,
  Activity,
  Lock,
  Trash2,
  EyeOff,
  ChevronRight,
  Save,
  Calendar,
  Zap,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import { toast } from "sonner";
import { formatDistanceToNow, isAfter, format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ApiKeysPage() {
  // --- CORE STATE ---
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");

  // Reveal Modal (The "Burn After Reading" view)
  const [revealModal, setRevealModal] = useState<{
    open: boolean;
    keyData: ApiKey | null;
  }>({
    open: false,
    keyData: null,
  });
  const [hasCopied, setHasCopied] = useState(false);

  // Detail & Action States
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);

  const currentOrgId = "org_12345";

  // --- 1. DATA SYNC ---
  const fetchKeys = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiKeyService.getOrgKeys(currentOrgId);
      setKeys(data);
    } catch (err) {
      toast.error("Manifest Access Denied");
    } finally {
      setIsLoading(false);
    }
  }, [currentOrgId]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  // --- 2. GENERATION PROTOCOL ---
  const handleCreateKey = async () => {
    if (!newKeyName) return toast.error("Key name required");
    setIsGenerating(true);
    try {
      const key = await apiKeyService.generateKey(currentOrgId, {
        name: newKeyName,
      });
      setRevealModal({ open: true, keyData: key });
      setNewKeyName("");
      fetchKeys();
    } catch (err) {
      toast.error("Provisioning Failed");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- 3. METADATA REVISION (PATCH) ---
  const handleUpdateMetadata = async (
    id: string,
    name: string,
    expiry: string,
  ) => {
    setIsActionPending(true);
    try {
      const updated = await apiKeyService.updateKeyMetadata(currentOrgId, id, {
        name,
        expiresAt: expiry || null,
      });
      setKeys((prev) => prev.map((k) => (k.id === id ? updated : k)));
      setSelectedKey(updated);
      toast.success("Metadata Synchronized");
    } catch (err) {
      toast.error("Update Denied");
    } finally {
      setIsActionPending(false);
    }
  };

  // --- 4. ROTATION PROTOCOL (PATCH /ROTATE) ---
  const handleRotateKey = async (id: string) => {
    setIsActionPending(true);
    try {
      const key = await apiKeyService.rotateKey(currentOrgId, id);
      setIsDrawerOpen(false);
      setRevealModal({ open: true, keyData: key });
      fetchKeys();
      toast.success("Rotation Complete", {
        description: "Old secret invalidated.",
      });
    } catch (err) {
      toast.error("Rotation Failed");
    } finally {
      setIsActionPending(false);
    }
  };

  // --- 5. TERMINATION PROTOCOL (DELETE) ---
  const handleRevokeKey = async (id: string) => {
    const backup = [...keys];
    setKeys((prev) => prev.filter((k) => k.id !== id));
    try {
      await apiKeyService.deleteKey(currentOrgId, id);
      setIsDrawerOpen(false);
      toast.success("Credential Terminated");
    } catch (err) {
      setKeys(backup);
      toast.error("Revocation Failed");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    toast.success("Secret Copied");
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-12 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-muted pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="w-5 h-5" strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">
              Auth Level: Infrastructure Admin
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase leading-none">
            API Keys
          </h1>
        </div>
      </div>

      {/* GENERATOR BAR */}
      <div className="p-8 rounded-[2.5rem] bg-card border-2 border-muted shadow-xl shadow-black/5 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-primary/20 transition-all">
        <div className="space-y-1">
          <h3 className="text-xl font-black uppercase italic tracking-tighter">
            Issue Credentials
          </h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Generate secrets for external automation
          </p>
        </div>
        <div className="flex gap-3">
          <Input
            placeholder="Key Label (e.g. Production API)"
            className="rounded-xl border-2 h-12 w-64 font-bold text-[10px] uppercase tracking-widest"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
          />
          <Button
            onClick={handleCreateKey}
            disabled={isGenerating}
            className="h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/10"
          >
            {isGenerating ? (
              <RefreshCw className="animate-spin w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Generate
          </Button>
        </div>
      </div>

      {/* THE LEDGER (LIST) */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4 opacity-30">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
        ) : keys.length > 0 ? (
          <div className="grid gap-4">
            {keys.map((key) => (
              <div
                key={key.id}
                onClick={() => {
                  setSelectedKey(key);
                  setIsDrawerOpen(true);
                }}
                className="group flex flex-col md:flex-row md:items-center gap-8 p-8 bg-card border-2 border-muted rounded-[2.5rem] hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-black uppercase italic tracking-tighter">
                      {key.name}
                    </h4>
                    <Badge
                      variant={key.isActive ? "default" : "secondary"}
                      className="rounded-lg text-[9px] font-black uppercase tracking-widest"
                    >
                      {key.isActive ? "Active" : "Revoked"}
                    </Badge>
                  </div>
                  <div className="font-mono text-sm font-bold text-muted-foreground bg-muted/30 w-fit px-3 py-1 rounded-lg border">
                    {key.keyPrefix}••••••••••••
                  </div>
                </div>
                <div className="hidden md:flex flex-col items-end opacity-40 group-hover:opacity-100 transition-opacity">
                  <p className="text-[9px] font-black uppercase tracking-widest">
                    Audit Dossier
                  </p>
                  <ChevronRight className="w-5 h-5 text-primary" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 border-4 border-dashed rounded-[3rem] flex items-center justify-center opacity-30">
            <EyeOff className="w-12 h-12" />
          </div>
        )}
      </div>

      {/* ONE-TIME REVEAL MODAL */}
      <Dialog
        open={revealModal.open}
        onOpenChange={(open) =>
          !open && setRevealModal({ open: false, keyData: null })
        }
      >
        <DialogContent className="max-w-xl rounded-[3rem] border-4 p-10">
          <DialogHeader className="space-y-4">
            <div className="flex items-center gap-4 text-primary">
              <ShieldCheck className="w-12 h-12" />
              <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">
                Secret provisioned
              </DialogTitle>
            </div>
            <DialogDescription className="text-base font-bold bg-primary/5 p-6 rounded-2xl border-2 border-primary/10 leading-relaxed">
              <AlertTriangle className="w-4 h-4 mb-2 text-primary" />
              This key is visible **ONLY ONCE**. Store it securely. Existing
              integrations will break if this was a rotation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-8">
            <div className="relative flex items-center bg-zinc-950 p-6 rounded-2xl border border-white/10 gap-4">
              <code className="flex-1 font-mono text-emerald-400 text-sm break-all font-bold tracking-tight">
                {revealModal.keyData?.keyPrefix}
              </code>
              <Button
                size="icon"
                onClick={() =>
                  copyToClipboard(revealModal.keyData?.keyPrefix || "")
                }
                className="rounded-xl h-12 w-12 bg-white/5 border border-white/10"
              >
                {hasCopied ? (
                  <CheckCircle2 className="text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setRevealModal({ open: false, keyData: null })}
              className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest"
            >
              Protocol Secure: Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DETAIL DOSSIER & MANAGEMENT DRAWER */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-[540px] border-l-4 p-0">
          {selectedKey && (
            <div className="h-full flex flex-col">
              <SheetHeader className="p-10 border-b bg-muted/5">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2 block">
                  Dossier // {selectedKey.keyPrefix}
                </span>
                <SheetTitle className="text-5xl font-black italic uppercase tracking-tighter leading-none">
                  {selectedKey.name}
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 p-10 space-y-12 overflow-y-auto">
                {/* METADATA EDIT FORM */}
                <div className="space-y-6 p-8 rounded-[2.5rem] border-2 border-muted bg-card shadow-inner">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 mb-6">
                    <Activity className="w-4 h-4 text-primary" /> Configuration
                  </h5>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">
                        Internal Name
                      </label>
                      <Input
                        defaultValue={selectedKey.name}
                        className="rounded-xl border-2 h-12 font-bold"
                        id="edit-name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">
                        TTL (Expiration)
                      </label>
                      <Input
                        type="date"
                        defaultValue={selectedKey.expiresAt?.split("T")[0]}
                        className="rounded-xl border-2 h-12 font-bold"
                        id="edit-expiry"
                      />
                    </div>
                    <Button
                      disabled={isActionPending}
                      onClick={() => {
                        const n = (
                          document.getElementById(
                            "edit-name",
                          ) as HTMLInputElement
                        ).value;
                        const e = (
                          document.getElementById(
                            "edit-expiry",
                          ) as HTMLInputElement
                        ).value;
                        handleUpdateMetadata(selectedKey.id, n, e);
                      }}
                      className="w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest"
                    >
                      {isActionPending ? (
                        <RefreshCw className="animate-spin w-4 h-4" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Sync Metadata
                    </Button>
                  </div>
                </div>

                {/* DANGER ZONE (ROTATION) */}
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-destructive flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Security Operations
                  </h5>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-14 rounded-2xl border-2 border-primary/20 font-black uppercase text-[10px] tracking-widest hover:bg-primary/5"
                      >
                        Rotate Credentials
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[2.5rem] border-4 border-primary/20">
                      <AlertDialogHeader>
                        <div className="flex items-center gap-3 text-primary mb-2">
                          <ShieldAlert className="w-8 h-8" />
                          <AlertDialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
                            Initialize Rotation?
                          </AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="text-sm font-bold leading-relaxed">
                          The current secret will be{" "}
                          <span className="text-destructive underline decoration-2">
                            immediately invalidated
                          </span>
                          . A new one will be generated for you to copy.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl h-12 font-black uppercase text-[10px]">
                          Abort
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRotateKey(selectedKey.id)}
                          className="rounded-xl h-12 bg-primary font-black uppercase text-[10px] px-8"
                        >
                          Confirm Rotation
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* FOOTER (REVOCATION) */}
              <div className="p-10 border-t bg-muted/20">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-destructive/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Revoke & Destroy
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-[2.5rem] border-4 border-destructive/20">
                    <AlertDialogHeader>
                      <div className="flex items-center gap-3 text-destructive mb-2">
                        <Zap className="w-8 h-8 animate-pulse" />
                        <AlertDialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-destructive">
                          Final Revocation
                        </AlertDialogTitle>
                      </div>
                      <AlertDialogDescription className="text-sm font-bold">
                        This is <span className="underline">irreversible</span>.
                        Existing integrations using this key will fail with a
                        401 Unauthorized immediately.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl h-12 font-black uppercase text-[10px]">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleRevokeKey(selectedKey.id)}
                        className="rounded-xl h-12 bg-destructive font-black uppercase text-[10px] px-8"
                      >
                        Permanently Destroy
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
