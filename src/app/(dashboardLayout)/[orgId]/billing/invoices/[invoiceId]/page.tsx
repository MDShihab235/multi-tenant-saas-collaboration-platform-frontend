"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  subscriptionService,
  InvoiceDetail,
} from "@/services/subscription.service";
import {
  ArrowLeft,
  Download,
  ShieldCheck,
  CreditCard,
  Calendar,
  Hash,
  Globe,
  CheckCircle2,
  Clock,
  Receipt,
  Loader2,
  FileText,
  AlertCircle,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function InvoiceDetailPage({
  params,
}: {
  params: { invoiceId: string };
}) {
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const orgId = "org_12345";
  const orgSlug = "acme-corp";

  // --- DATA FETCHING ---
  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await subscriptionService.getInvoiceDetail(
        orgId,
        params.invoiceId,
      );
      setInvoice(data);
    } catch (err) {
      toast.error("Ledger Access Denied", {
        description: "We couldn't retrieve this transaction record.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [orgId, params.invoiceId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // --- PDF DOWNLOAD HANDLER (JIT Signed URL) ---
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const pdfUrl = await subscriptionService.getInvoicePdfUrl(
        orgId,
        params.invoiceId,
      );

      // Programmatic Trigger
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.target = "_blank";
      link.download = `invoice-${params.invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Document Decrypted", {
        description: "Your PDF is ready.",
      });
    } catch (err) {
      toast.error("Procurement Failed", {
        description: "Could not generate secure download link.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading)
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 animate-pulse">
        <RefreshCw className="w-10 h-10 animate-spin text-primary/20" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
          Authenticating Ledger
        </p>
      </div>
    );

  if (!invoice)
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">
          Record Not Found
        </h2>
        <Button
          asChild
          variant="outline"
          className="rounded-xl font-black uppercase text-[10px]"
        >
          <Link href={`/${orgSlug}/billing/invoices`}>Return to History</Link>
        </Button>
      </div>
    );

  const isPaid = invoice.status === "PAID";

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* 1. NAVIGATION & TOP ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-2 border-muted pb-8">
        <Link
          href={`/${orgSlug}/billing/invoices`}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          Invoice History
        </Link>

        <div className="flex gap-3 w-full md:w-auto">
          <Button
            disabled={isDownloading}
            onClick={handleDownloadPdf}
            className="flex-1 md:flex-none rounded-2xl h-12 px-8 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/10 transition-all hover:scale-105"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isDownloading ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* 2. STATUS HEADER CARD */}
      <div
        className={cn(
          "relative p-12 rounded-[3.5rem] border-4 flex flex-col md:flex-row justify-between items-center gap-10 overflow-hidden shadow-2xl shadow-black/5",
          isPaid
            ? "bg-emerald-500/[0.03] border-emerald-500/20"
            : "bg-amber-500/[0.03] border-amber-500/20",
        )}
      >
        <div className="space-y-6 text-center md:text-left relative z-10">
          <Badge
            className={cn(
              "rounded-xl px-5 py-1.5 font-black text-[10px] uppercase tracking-[0.2em] border-2",
              isPaid
                ? "bg-emerald-500 text-white border-emerald-400"
                : "bg-amber-500 text-black border-amber-400",
            )}
          >
            {isPaid ? (
              <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
            ) : (
              <Clock className="w-3.5 h-3.5 mr-2" />
            )}
            {invoice.status}
          </Badge>

          <div className="space-y-1">
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
              ${(invoice.amount / 100).toFixed(2)}
            </h1>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              {invoice.currency.toUpperCase()} Total Amount Due
            </p>
          </div>
        </div>

        {/* METADATA BOX */}
        <div className="bg-card p-8 rounded-[2.5rem] border-2 min-w-[280px] space-y-4 relative z-10 shadow-inner">
          <div className="flex justify-between items-center pb-3 border-b border-muted">
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest italic">
              Invoice Ref
            </span>
            <span className="text-[11px] font-mono font-bold uppercase">
              {invoice.id.slice(-12)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest italic">
              {isPaid ? "Settled On" : "Due Date"}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-tight">
              {isPaid
                ? format(new Date(invoice.paidAt!), "MMM dd, yyyy")
                : format(new Date(invoice.dueDate!), "MMM dd, yyyy")}
            </span>
          </div>
        </div>

        {/* Background Visual Flair */}
        <Receipt className="absolute -right-8 -bottom-8 w-48 h-48 opacity-5 -rotate-12 pointer-events-none" />
      </div>

      {/* 3. ITEMIZED BREAKDOWN */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-black uppercase italic tracking-tighter">
            Manifest Details
          </h3>
        </div>

        <div className="bg-card border-2 border-muted rounded-[2.5rem] overflow-hidden">
          <div className="p-10 space-y-10">
            {/* Primary Item */}
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-2xl font-black uppercase italic tracking-tight leading-none">
                  {invoice.planName} Tier Access
                </p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(invoice.periodStart), "MMM dd")} —{" "}
                  {format(new Date(invoice.periodEnd), "MMM dd, yyyy")}
                </div>
              </div>
              <span className="font-black italic text-2xl tracking-tighter">
                ${(invoice.subtotal / 100).toFixed(2)}
              </span>
            </div>

            {/* Subtotal Calculations */}
            <div className="space-y-4 max-w-[320px] ml-auto border-t-2 border-muted pt-8">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Plan Subtotal</span>
                <span>${(invoice.subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Applied Tax (VAT/GST)</span>
                <span>${(invoice.tax / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-6 border-t-2 border-primary/20">
                <div className="space-y-0.5">
                  <span className="block text-xs font-black uppercase italic tracking-tighter">
                    Total Charged
                  </span>
                  <span className="block text-[8px] font-bold text-muted-foreground uppercase italic tracking-widest">
                    Final Amount Settled
                  </span>
                </div>
                <span className="text-4xl font-black italic tracking-tighter text-primary">
                  ${(invoice.amount / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. COMPLIANCE & RECONCILIATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        <div className="p-8 rounded-[2.5rem] bg-muted/20 border-2 border-muted flex items-center gap-5 hover:bg-muted/30 transition-colors">
          <div className="h-12 w-12 rounded-2xl bg-white border-2 border-muted flex items-center justify-center text-emerald-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">
              Verification Status
            </p>
            <p className="text-[11px] font-bold uppercase tracking-tight italic">
              Transaction Fully Verified
            </p>
          </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-muted/20 border-2 border-muted flex items-center gap-5 hover:bg-muted/30 transition-colors">
          <div className="h-12 w-12 rounded-2xl bg-white border-2 border-muted flex items-center justify-center text-primary">
            <Globe className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">
              Stripe Subscription ID
            </p>
            <p className="text-[11px] font-mono font-bold uppercase tracking-tight truncate max-w-[180px]">
              {invoice.subscriptionId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
