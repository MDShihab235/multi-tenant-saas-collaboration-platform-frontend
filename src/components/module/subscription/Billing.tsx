"use client";

import { useEffect, useState, useCallback } from "react";
import {
  subscriptionService,
  Subscription,
  OrgUsage,
  BillingCycle,
} from "@/services/subscription.service";
import {
  Clock,
  RefreshCw,
  Receipt,
  ExternalLink,
  Users,
  Layers,
  CheckSquare,
  TrendingUp,
  Zap,
  PlayCircle,
  StopCircle,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";

export default function BillingPage() {
  // --- STATE ---
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<OrgUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionPending, setIsActionPending] = useState(false);
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [pendingCycle, setPendingCycle] = useState<BillingCycle>("MONTHLY");

  console.log("Subscription: ", subscription);
  console.log("Usage: ", usage);

  const { orgId } = useParams(); // Context-driven

  // --- DATA SYNC ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [subData, usageData] = await Promise.all([
        subscriptionService.getSubscription(orgId as string),
        subscriptionService.getUsage(orgId as string),
      ]);
      setSubscription(subData);
      setUsage(usageData);
    } catch (err) {
      toast.error("Ledger Sync Failed");
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- ACTIONS ---
  const handleUpdate = async (
    action: () => Promise<any>,
    successMsg: string,
  ) => {
    setIsActionPending(true);
    try {
      const updated = await action();
      setSubscription(updated);
      toast.success(successMsg);
      if (showCycleModal) setShowCycleModal(false);
    } catch (err) {
      toast.error("Transaction Aborted");
    } finally {
      setIsActionPending(false);
    }
  };

  const handleCancel = async () => {
    setIsActionPending(true);

    try {
      const updatedSub = await subscriptionService.cancelSubscription(
        orgId as string,
      );

      // Update local state so the Reactivation Banner appears and
      // the Danger Zone button disappears immediately.
      setSubscription(updatedSub);

      toast.success("Renewal Deactivated", {
        description: `Your Pro features remain active until ${format(new Date(updatedSub.currentPeriodEnd), "MMMM dd, yyyy")}.`,
        icon: <StopCircle className="text-destructive w-5 h-5" />,
      });
    } catch (err) {
      toast.error("Cancellation Failed", {
        description:
          "Our billing gateway rejected the termination request. Please try again.",
      });
    } finally {
      setIsActionPending(false);
    }
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center animate-pulse">
        <RefreshCw className="w-10 h-10 animate-spin text-muted" />
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-16 animate-in fade-in duration-700">
      {/* 1. HEADER & GLOBAL TOGGLE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-4 border-muted pb-12">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Zap className="w-5 h-5 fill-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">
              Commercial Ops
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase leading-none">
            Billing
          </h1>
        </div>

        {subscription && (
          <div className="bg-muted/20 p-6 rounded-[2rem] border-2 border-muted flex items-center gap-6">
            <span
              className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                subscription.billingCycle === "MONTHLY"
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              Monthly
            </span>
            <Switch
              checked={subscription.billingCycle === "YEARLY"}
              onCheckedChange={(checked) => {
                setPendingCycle(checked ? "YEARLY" : "MONTHLY");
                setShowCycleModal(true);
              }}
            />
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  subscription.billingCycle === "YEARLY"
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                Yearly
              </span>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black">
                -20% SAVINGS
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* 2. CANCELLATION RECOVERY BANNER */}
      {subscription?.cancelAtPeriodEnd && (
        <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border-2 border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-amber-500/5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                Pending Termination
              </p>
              <p className="text-sm font-bold italic uppercase">
                Your access expires{" "}
                {format(
                  new Date(subscription.currentPeriodEnd),
                  "MMMM dd, yyyy",
                )}
              </p>
            </div>
          </div>
          <Button
            disabled={isActionPending}
            onClick={() =>
              handleUpdate(
                () =>
                  subscriptionService.reactivateSubscription(orgId as string),
                "Plan Restored",
              )
            }
            className="h-12 px-8 rounded-xl bg-amber-600 hover:bg-amber-700 font-black uppercase text-[10px] tracking-widest"
          >
            {isActionPending ? (
              <RefreshCw className="animate-spin w-4 h-4" />
            ) : (
              <PlayCircle className="w-4 h-4 mr-2" />
            )}
            Resume Subscription
          </Button>
        </div>
      )}

      {/* 3. QUOTA UTILIZATION TRACKERS */}
      {usage && (
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-black uppercase italic tracking-tighter">
              Resource Quotas
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Members", icon: Users, data: usage.members },
              { label: "Projects", icon: Layers, data: usage.projects },
              { label: "Tasks", icon: CheckSquare, data: usage.tasks },
            ].map((m) => {
              if (!m.data) return null;

              const used = m.data.used || 0;
              const limit = m.data.limit;
              const perc = limit ? (used / limit) * 100 : 0;
              // const perc = m.data.limit
              //   ? (m.data.used / m.data.limit) * 100
              //   : 0;
              return (
                <div
                  key={m.label}
                  className="p-8 rounded-[2.5rem] bg-card border-2 border-muted shadow-sm hover:border-primary/20 transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <m.icon className="w-6 h-6 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      {m.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-black italic tracking-tighter">
                      {m.data.used}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      / {m.data.limit ?? "∞"}
                    </span>
                  </div>
                  <Progress
                    value={perc > 100 ? 100 : perc}
                    className={cn(
                      "h-2 rounded-full",
                      perc >= 90
                        ? "[&>div]:bg-destructive"
                        : "[&>div]:bg-primary",
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. BILLING MANIFEST (INVOICES) */}
      {subscription && (
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-black uppercase italic tracking-tighter">
              Transaction Ledger
            </h3>
          </div>
          <div className="bg-card border-2 border-muted rounded-[2.5rem] overflow-hidden">
            {/* SAFE GUARD CHECK: Ensure invoices exists and has items */}
            {!subscription.invoices || subscription.invoices.length === 0 ? (
              <div className="p-12 text-center text-sm font-bold uppercase tracking-wider text-muted-foreground italic">
                No transaction history available on this account.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-muted bg-muted/20 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5">Amount</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-muted">
                  {/* Added optional chaining and empty-array fallback */}
                  {(subscription.invoices ?? []).map((inv) => {
                    return (
                      <tr key={inv.id} className="hover:bg-muted/5">
                        <td className="px-8 py-6 text-xs font-bold uppercase italic">
                          {format(new Date(inv.createdAt), "MMM dd, yyyy")}
                        </td>
                        {/* Notice: Changed inv.amount to inv.amountPaid to align with standard invoice models */}
                        <td className="px-8 py-6 font-black italic text-lg">
                          ${Number(inv.amountPaid || 0).toFixed(2)}
                        </td>
                        <td className="px-8 py-6">
                          <Badge className="rounded-lg text-[8px] font-black tracking-widest uppercase">
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="px-8 py-6 text-right">
                          {inv.hostedInvoiceUrl ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              className="rounded-xl"
                            >
                              <a
                                href={inv.hostedInvoiceUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground px-3">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 5. DANGER ZONE (TERMINATION) */}
      {subscription && !subscription.cancelAtPeriodEnd && (
        <div className="pt-12 border-t-4 border-muted">
          <div className="p-10 rounded-[3rem] border-4 border-destructive/10 bg-destructive/2 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="text-2xl font-black uppercase italic tracking-tighter text-destructive">
                Danger Zone
              </h4>
              <p className="text-xs font-bold text-muted-foreground uppercase">
                Disable auto-renewal. Access remains until period end.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="h-14 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-destructive/20"
                >
                  Stop Subscription
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[2.5rem] border-4 p-10">
                <AlertDialogHeader className="space-y-4">
                  <div className="flex items-center gap-4 text-destructive mb-2">
                    <StopCircle className="w-10 h-10" />
                    <AlertDialogTitle className="text-3xl font-black uppercase italic tracking-tighter">
                      Terminate Renewal?
                    </AlertDialogTitle>
                  </div>
                  <AlertDialogDescription className="text-base font-bold text-foreground/70 leading-relaxed bg-muted/30 p-6 rounded-2xl">
                    You will keep your features until{" "}
                    <span className="text-destructive underline underline-offset-4">
                      {format(new Date(subscription.currentPeriodEnd), "PPP")}
                    </span>
                    . After that, your org reverts to Free.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-8 gap-4">
                  <AlertDialogCancel className="rounded-xl h-12 font-black uppercase text-[10px] flex-1">
                    Abort
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    className="rounded-xl h-12 bg-destructive font-black uppercase text-[10px] flex-1"
                  >
                    Confirm Cancellation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {/* 6. CYCLE SHIFT MODAL */}
      <Dialog open={showCycleModal} onOpenChange={setShowCycleModal}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-4 p-10">
          <DialogHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <ArrowRightLeft className="w-16 h-16 text-primary mb-2" />
            </div>
            <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">
              Switch Cadence?
            </DialogTitle>
            <DialogDescription className="text-base font-bold">
              Transitioning to **{pendingCycle}** billing.{" "}
              {pendingCycle === "YEARLY"
                ? "You'll save 20% compared to monthly."
                : "You'll move to monthly flexibility."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 gap-4">
            <Button
              variant="outline"
              onClick={() => setShowCycleModal(false)}
              className="rounded-xl h-12 font-black uppercase text-[10px] flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                handleUpdate(
                  () =>
                    subscriptionService.updateBillingCycle(
                      orgId as string,
                      pendingCycle,
                    ),
                  "Cadence Shifted",
                )
              }
              className="rounded-xl h-12 font-black uppercase text-[10px] flex-1"
            >
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
