"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function InvoiceDetailPage({
  params,
}: {
  params: { invoiceId: string };
}) {
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const orgId = "org_12345";
  const orgSlug = "acme-corp";

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await subscriptionService.getInvoiceDetail(
          orgId,
          params.invoiceId,
        );
        setInvoice(data);
      } catch (err) {
        console.error("Audit retrieval failed");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [orgId, params.invoiceId]);

  if (isLoading)
    return (
      <div className="p-20 text-center animate-pulse font-black uppercase italic tracking-widest">
        Decrypting Ledger...
      </div>
    );
  if (!invoice)
    return (
      <div className="p-20 text-center font-black uppercase italic">
        Invoice Not Found
      </div>
    );

  const isPaid = invoice.status === "PAID";

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. TOP NAV & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <Link
          href={`/${orgSlug}/billing/invoices`}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          Invoice History
        </Link>

        <Button
          variant="outline"
          asChild
          className="rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest"
        >
          <a href={invoice.hostedInvoiceUrl} target="_blank" rel="noreferrer">
            <Download className="w-4 h-4 mr-2" /> Download PDF Receipt
          </a>
        </Button>
      </div>

      {/* 2. STATUS HEADER */}
      <div
        className={cn(
          "p-10 rounded-[3rem] border-4 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl shadow-black/5",
          isPaid
            ? "bg-emerald-500/5 border-emerald-500/20"
            : "bg-amber-500/5 border-amber-500/20",
        )}
      >
        <div className="space-y-4 text-center md:text-left">
          <Badge
            className={cn(
              "rounded-xl px-4 py-1 font-black text-[10px] uppercase tracking-widest",
              isPaid ? "bg-emerald-500 text-white" : "bg-amber-500 text-black",
            )}
          >
            {isPaid ? (
              <CheckCircle2 className="w-3 h-3 mr-2" />
            ) : (
              <Clock className="w-3 h-3 mr-2" />
            )}
            {invoice.status}
          </Badge>
          <div className="space-y-1">
            <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
              ${(invoice.amount / 100).toFixed(2)}
            </h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {invoice.currency.toUpperCase()} • {invoice.planName}
            </p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-[2rem] border-2 min-w-[240px] space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">
              Reference
            </span>
            <span className="text-[11px] font-mono font-bold uppercase">
              {invoice.id.slice(-12)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">
              {isPaid ? "Paid On" : "Due Date"}
            </span>
            <span className="text-[11px] font-bold uppercase">
              {isPaid
                ? format(new Date(invoice.paidAt!), "MMM dd, yyyy")
                : format(new Date(invoice.dueDate!), "MMM dd, yyyy")}
            </span>
          </div>
        </div>
      </div>

      {/* 3. BREAKDOWN LEDGER */}
      <div className="space-y-6">
        <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
          <Receipt className="w-5 h-5 text-primary" /> Itemized Breakdown
        </h3>

        <div className="bg-card border-2 border-muted rounded-[2.5rem] overflow-hidden">
          <div className="p-10 space-y-8">
            {/* Line Item */}
            <div className="flex justify-between items-start pb-8 border-b-2 border-muted border-dashed">
              <div className="space-y-1">
                <p className="font-black uppercase italic tracking-tight">
                  {invoice.planName} Plan Access
                </p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {format(new Date(invoice.periodStart), "MMM dd")} —{" "}
                  {format(new Date(invoice.periodEnd), "MMM dd, yyyy")}
                </p>
              </div>
              <span className="font-black italic text-lg">
                ${(invoice.subtotal / 100).toFixed(2)}
              </span>
            </div>

            {/* Totals Section */}
            <div className="space-y-4 max-w-[300px] ml-auto">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Subtotal</span>
                <span>${(invoice.subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Tax / VAT</span>
                <span>${(invoice.tax / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-4 border-t-2 border-muted">
                <span className="text-sm font-black uppercase italic tracking-tighter">
                  Total Amount
                </span>
                <span className="text-2xl font-black italic tracking-tighter">
                  ${(invoice.amount / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SECURITY & AUTHENTICITY ADVISORY */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 p-8 rounded-[2rem] bg-muted/20 border-2 border-muted flex items-center gap-4">
          <ShieldCheck className="w-8 h-8 text-emerald-500 opacity-50" />
          <div className="space-y-0.5">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              Payment Verified
            </p>
            <p className="text-[11px] font-bold uppercase tracking-tight">
              Secured by Stripe Infrastructure
            </p>
          </div>
        </div>
        <div className="flex-1 p-8 rounded-[2rem] bg-muted/20 border-2 border-muted flex items-center gap-4">
          <Globe className="w-8 h-8 text-primary opacity-50" />
          <div className="space-y-0.5">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              Audit ID
            </p>
            <p className="text-[11px] font-mono font-bold uppercase tracking-tight">
              {invoice.subscriptionId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
