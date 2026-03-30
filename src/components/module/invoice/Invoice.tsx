"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { subscriptionService, Invoice } from "@/services/subscription.service";
import {
  Receipt,
  ArrowLeft,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function InvoicesPage() {
  // --- STATE ---
  const [data, setData] = useState<{
    invoices: Invoice[];
    totalPages: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Replace with your actual context/hook logic
  const orgId = "org_12345";
  const orgSlug = "acme-corp";

  // --- DATA FETCHING ---
  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await subscriptionService.getInvoices(orgId, page);
      setData(result);
    } catch (err) {
      console.error("Audit Sync Interrupted");
    } finally {
      setIsLoading(false);
    }
  }, [orgId, page]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // --- HELPER: STATUS STYLING ---
  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      PAID: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      OPEN: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      DRAFT: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
      VOID: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return styles[status] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-10 animate-in fade-in duration-700">
      {/* 1. HEADER & NAVIGATION */}
      <div className="space-y-6">
        <Link
          href={`/${orgSlug}/billing`}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          Return to Billing Overview
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Receipt className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
                Invoices
              </h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
                Financial Audit Ledger
              </p>
            </div>
          </div>

          {isLoading && (
            <RefreshCw className="w-5 h-5 animate-spin text-muted" />
          )}
        </div>
      </div>

      {/* 2. THE LEDGER TABLE */}
      <div className="bg-card border-2 border-muted rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-muted bg-muted/10 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              <th className="px-10 py-6">Issued Date</th>
              <th className="px-10 py-6 text-center">Status</th>
              <th className="px-10 py-6">Amount</th>
              <th className="px-10 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y border-muted">
            {isLoading ? (
              // SKELETON ROWS
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="px-10 py-8 bg-muted/5 h-20" />
                </tr>
              ))
            ) : data?.invoices.length ? (
              data.invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="group hover:bg-muted/5 transition-colors"
                >
                  <td className="px-10 py-8 font-bold text-sm uppercase italic">
                    {format(new Date(inv.createdAt), "MMM dd, yyyy")}
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex justify-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-lg px-3 py-1 font-black text-[9px] uppercase tracking-widest border-2",
                          getStatusStyle(inv.status),
                        )}
                      >
                        {inv.status === "PAID" && (
                          <CheckCircle2 className="w-3 h-3 mr-1.5" />
                        )}
                        {inv.status === "OPEN" && (
                          <Clock className="w-3 h-3 mr-1.5" />
                        )}
                        {inv.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-xl font-black italic tracking-tighter">
                      ${(inv.amount / 100).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="rounded-xl hover:bg-primary/10 hover:text-primary"
                      >
                        <Link href={`/${orgSlug}/billing/invoices/${inv.id}`}>
                          <FileText className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="rounded-xl hover:bg-emerald-500/10 hover:text-emerald-600"
                      >
                        <a
                          href={inv.hostedInvoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="p-20 text-center font-black uppercase tracking-widest opacity-20 italic"
                >
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 3. PAGINATION */}
        {!isLoading && data && data.totalPages > 1 && (
          <div className="p-8 border-t-2 border-muted flex items-center justify-between bg-muted/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
              Manifest Page {page} of {data.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl border-2 h-10 w-10 disabled:opacity-30"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl border-2 h-10 w-10 disabled:opacity-30"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* COMPLIANCE FOOTER */}
      <div className="p-10 border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center text-center space-y-3 opacity-40 hover:opacity-100 transition-opacity">
        <AlertCircle className="w-6 h-6 text-primary" />
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">
            Data Compliance & Taxation
          </p>
          <p className="text-xs font-bold leading-relaxed max-w-sm">
            All invoices include applicable VAT/GST. To update your corporate
            Tax ID, visit the Customer Portal.
          </p>
        </div>
      </div>
    </div>
  );
}
