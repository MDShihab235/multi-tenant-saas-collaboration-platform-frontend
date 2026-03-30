"use client";

import { useEffect, useState } from "react";
import {
  adminService,
  FileItem,
  PaginatedFiles,
} from "@/services/admin.service";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileIcon,
  Video,
  ImageIcon,
  FileText,
  HardDrive,
  Download,
  User,
  ChevronLeft,
  ChevronRight,
  FilterX,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminFilesPage() {
  const [data, setData] = useState<PaginatedFiles | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [mimeType, setMimeType] = useState<string>("ALL");

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const queryMime = mimeType === "ALL" ? undefined : mimeType;
      const result = await adminService.getFiles({
        page,
        limit: 10,
        mimeType: queryMime,
      });
      setData(result);
    } catch (error) {
      toast.error("Failed to load platform files.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [page, mimeType]);

  // Utility to format bytes into KB/MB/GB
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mime: string) => {
    if (mime.startsWith("video/"))
      return <Video className="h-4 w-4 text-purple-500" />;
    if (mime.startsWith("image/"))
      return <ImageIcon className="h-4 w-4 text-blue-500" />;
    if (mime.startsWith("application/pdf"))
      return <FileText className="h-4 w-4 text-red-500" />;
    return <FileIcon className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Storage Monitoring
          </h1>
          <p className="text-muted-foreground">
            Audit and manage all assets uploaded across the platform.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select
            value={mimeType}
            onValueChange={(val) => {
              setMimeType(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All File Types</SelectItem>
              <SelectItem value="image/">Images</SelectItem>
              <SelectItem value="video/">Videos</SelectItem>
              <SelectItem value="audio/">Audio</SelectItem>
              <SelectItem value="application/pdf">PDFs</SelectItem>
              <SelectItem value="application/zip">Archives (ZIP)</SelectItem>
            </SelectContent>
          </Select>

          {mimeType !== "ALL" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMimeType("ALL")}
            >
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Files tracked globally
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-xl bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploader</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading assets...
                </TableCell>
              </TableRow>
            ) : (
              data?.files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="max-w-[300px]">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.mimeType)}
                      <span className="font-medium truncate" title={file.name}>
                        {file.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="text-[10px] uppercase font-mono"
                    >
                      {file.mimeType.split("/")[1]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {formatBytes(file.size)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">
                          {file.uploader.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {file.uploader.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <p className="text-sm text-muted-foreground">
            Page {page} of {data?.totalPages || 1}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= (data?.totalPages || 1)}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
