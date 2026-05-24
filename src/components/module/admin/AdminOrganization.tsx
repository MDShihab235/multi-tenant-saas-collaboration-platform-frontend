"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminService, PaginatedOrganizations } from "@/services/admin.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Building2,
  Users,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Globe,
} from "lucide-react";

export default function AdminOrganizationsPage() {
  const [data, setData] = useState<PaginatedOrganizations | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  console.log(" Fetched Organizations: ", data?.data);
  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const result = await adminService.getOrganizations({
        page,
        limit: 10,
        search,
      });
      setData(result);
    } catch (error) {
      console.error("Failed to fetch organizations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrgs();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [page, search]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Platform Organizations
        </h1>
        <p className="text-muted-foreground">
          Monitor and manage all tenant organizations across the platform.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or slug..."
            className="pl-8"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Badge variant="secondary" className="h-10 px-4 py-2">
          Total: {data?.totalCount || 0}
        </Badge>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-muted-foreground"
                >
                  Fetching organizations...
                </TableCell>
              </TableRow>
            ) : (data?.data ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  No organizations found.
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-semibold">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {org.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      {org.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{org.owner.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {org.owner.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={org.planId === "PRO" ? "default" : "outline"}
                    >
                      {org.planId || "Free"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {org._count.memberships}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/organizations/${org.id}`}>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing page {page} of {data?.totalPages || 1}
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= (data?.totalPages || 1) || loading}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
