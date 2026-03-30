"use client";

import { useEffect, useState } from "react";
import { adminService, Invoice } from "@/services/admin.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, lastPage: 1 });

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const queryStatus = status === "ALL" ? undefined : status;
      const response = await adminService.getInvoices({
        page,
        limit: 10,
        status: queryStatus,
      });
      setInvoices(response.data);
      setMeta(response.meta);
    } catch (error) {
      toast.error("Failed to load platform invoices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, status]);

  const getStatusBadge = (status: Invoice["status"]) => {
    const styles = {
      PAID: "bg-green-100 text-green-700 border-green-200",
      OPEN: "bg-blue-100 text-blue-700 border-blue-200",
      PAST_DUE: "bg-red-100 text-red-700 border-red-200",
      VOID: "bg-gray-100 text-gray-700 border-gray-200",
      UNCOLLECTIBLE: "bg-orange-100 text-orange-700 border-orange-200",
    };
    return (
      <Badge variant="outline" className={styles[status]}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
      {/* Header & Stats */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Invoice Management
          </h1>
          <p className="text-muted-foreground">
            Monitor platform revenue, collections, and dunning status.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase ml-1">
              Filter Status
            </span>
            <Select
              value={status}
              onValueChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="OPEN">Open (Awaiting)</SelectItem>
                <SelectItem value="PAST_DUE">Past Due</SelectItem>
                <SelectItem value="UNCOLLECTIBLE">Uncollectible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Revenue Health Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4 border-l-4 border-l-green-500">
          <div className="p-2 bg-green-50 rounded-full">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase">
              Paid This Period
            </p>
            <p className="text-xl font-bold">Total Platform Revenue</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="p-2 bg-blue-50 rounded-full">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase">
              Awaiting Collection
            </p>
            <p className="text-xl font-bold">Open Receivables</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 border-l-4 border-l-red-500">
          <div className="p-2 bg-red-50 rounded-full">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase">
              At Risk
            </p>
            <p className="text-xl font-bold text-red-600">Past Due Invoices</p>
          </div>
        </Card>
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  Loading invoices...
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-semibold">
                    {invoice.subscription.organization.name}
                  </TableCell>
                  <TableCell className="font-mono">
                    {(invoice.amount / 100).toLocaleString("en-US", {
                      style: "currency",
                      currency: invoice.currency,
                    })}
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(invoice.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <FileText className="h-4 w-4" /> View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
          <p className="text-sm text-muted-foreground">
            Showing Page <strong>{page}</strong> of{" "}
            <strong>{meta.lastPage}</strong>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === meta.lastPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple internal Card component for the dashboard stats
function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-card rounded-xl border shadow-sm ${className}`}>
      {children}
    </div>
  );
}
