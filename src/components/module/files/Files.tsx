"use client";

import { useEffect, useState, useCallback } from "react";
import { fileService, FileRecord } from "@/services/file.service";
import {
  UploadCloud,
  CheckCircle2,
  Loader2,
  HardDrive,
  FileText,
  ImageIcon,
  ShieldCheck,
  ArrowUpRight,
  Search,
  LayoutGrid,
  List,
  Trash2,
  X,
  Download,
  Maximize2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
import Image from "next/image";

export default function FilesPage() {
  // --- STATE ---
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<{
    name: string;
    progress: number;
  } | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<FileRecord | null>(
    null,
  );
  const [isInspecting, setIsInspecting] = useState<string | null>(null);

  // --- 1. DATA INITIALIZATION ---
  const fetchMyFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fileService.getMyFiles();
      setFiles(data);
    } catch (err) {
      toast.error("Vault Sync Error", {
        description: "Could not retrieve your cloud archive.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyFiles();
  }, [fetchMyFiles]);

  // --- 2. UPLOAD PROTOCOL ---
  const handleUpload = async (file: File) => {
    setUploadingFile({ name: file.name, progress: 0 });
    try {
      const newFile = await fileService.uploadFile(file, (percent) => {
        setUploadingFile((prev) =>
          prev ? { ...prev, progress: percent } : null,
        );
      });
      setFiles((prev) => [newFile, ...prev]);
      toast.success("Inbound asset secured.");
    } catch (err) {
      toast.error("Upload Aborted");
    } finally {
      setUploadingFile(null);
    }
  };

  // --- 3. INSPECTION & DOWNLOAD ---
  const handleInspect = async (fileId: string) => {
    setIsInspecting(fileId);
    try {
      const fileData = await fileService.getFileById(fileId);
      if (fileData.mimeType.startsWith("image/")) {
        setSelectedPreview(fileData);
      } else {
        const link = document.createElement("a");
        link.href = fileData.url;
        link.download = fileData.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.info("Download initiated.");
      }
    } catch (err) {
      toast.error("Security Access Denied");
    } finally {
      setIsInspecting(null);
    }
  };

  // --- 4. TERMINATION (DELETE) ---
  const handleDelete = async (fileId: string) => {
    const backup = [...files];
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    try {
      await fileService.deleteFile(fileId);
      toast.success("Asset Purged from Cloudinary.");
    } catch (err) {
      setFiles(backup);
      toast.error("Termination failed.");
    }
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center font-black animate-pulse uppercase tracking-[0.4em] text-xs">
        Accessing Encrypted Vault...
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 space-y-12 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b-4 border-muted pb-12">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="w-5 h-5" strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">
              Storage Sector 4 // Verified
            </span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter italic uppercase leading-none">
            The Vault
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-muted/10 p-4 rounded-[2.5rem] border-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Filter Assets..."
              className="pl-11 w-48 lg:w-64 rounded-2xl border-none bg-background h-10 text-[10px] font-black uppercase tracking-widest"
            />
          </div>
          <div className="h-8 w-[2px] bg-muted mx-2" />
          <HardDrive className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-tighter">
            {files.length} Assets Stored
          </span>
        </div>
      </div>

      {/* DRAG & DROP ZONE */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0]);
        }}
        className={cn(
          "relative group rounded-[4rem] border-4 border-dashed transition-all duration-500 p-16 flex flex-col items-center justify-center text-center space-y-6",
          isDragging
            ? "border-primary bg-primary/5 scale-[0.98]"
            : "border-muted/60 bg-muted/5 hover:border-primary/40",
        )}
      >
        <input
          type="file"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) =>
            e.target.files?.[0] && handleUpload(e.target.files[0])
          }
        />
        <div className="p-10 bg-background rounded-full shadow-2xl group-hover:scale-110 transition-transform duration-500 border-2 border-muted/20">
          <UploadCloud
            className={cn(
              "w-14 h-14",
              isDragging ? "text-primary" : "text-muted-foreground/30",
            )}
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-black uppercase italic tracking-tighter">
            Initialize Transmission
          </h3>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em]">
            Drop assets to encrypt or click to browse
          </p>
        </div>
      </div>

      {/* PROGRESS TRACKER */}
      {uploadingFile && (
        <div className="p-8 rounded-[3rem] bg-card border-4 border-primary/20 shadow-2xl animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <p className="text-sm font-black uppercase tracking-tight italic truncate max-w-sm">
                {uploadingFile.name}
              </p>
            </div>
            <p className="text-xs font-black text-primary">
              {uploadingFile.progress}%
            </p>
          </div>
          <Progress
            value={uploadingFile.progress}
            className="h-3 rounded-full bg-muted shadow-inner"
          />
        </div>
      )}

      {/* ASSET GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {files.length > 0 ? (
          files.map((file) => (
            <div
              key={file.id}
              className="group relative bg-card border-2 border-muted rounded-[3rem] p-8 hover:border-primary/40 transition-all hover:shadow-2xl active:scale-[0.98]"
            >
              {/* DELETE ACTION */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-[2.5rem] border-4 p-8">
                    <AlertDialogHeader>
                      <div className="flex items-center gap-4 text-destructive mb-4">
                        <Zap className="w-10 h-10" />
                        <AlertDialogTitle className="text-3xl font-black uppercase italic tracking-tighter text-destructive">
                          Confirm Wipe
                        </AlertDialogTitle>
                      </div>
                      <AlertDialogDescription className="text-sm font-medium">
                        Permanently destroy{" "}
                        <strong className="text-foreground">{file.name}</strong>
                        ? This wipes the binary from Cloudinary servers forever.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8">
                      <AlertDialogCancel className="rounded-xl font-black uppercase text-[10px]">
                        Abort
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(file.id)}
                        className="rounded-xl bg-destructive font-black uppercase text-[10px] px-8"
                      >
                        Confirm Deletion
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* CARD CONTENT */}
              <div
                className="cursor-pointer"
                onClick={() => handleInspect(file.id)}
              >
                <div className="flex items-center justify-center mb-8 h-24 w-full bg-muted/10 rounded-[1.5rem] relative group-hover:bg-primary/5 transition-colors">
                  {isInspecting === file.id ? (
                    <Loader2 className="w-10 h-10 animate-spin text-primary/30" />
                  ) : file.mimeType.startsWith("image/") ? (
                    <ImageIcon className="w-10 h-10 text-blue-500" />
                  ) : (
                    <FileText className="w-10 h-10 text-emerald-500" />
                  )}
                  <Maximize2 className="absolute opacity-0 group-hover:opacity-20 w-12 h-12 text-primary transition-opacity" />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-lg font-black uppercase tracking-tighter leading-tight truncate">
                      {file.name}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <span>
                        {(file.sizeBytes / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <span>{format(new Date(file.createdAt), "MMM dd")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full h-[300px] border-4 border-dashed border-muted rounded-[4rem] flex flex-col items-center justify-center opacity-30 grayscale">
            <HardDrive className="w-12 h-12 mb-4" />
            <p className="text-xl font-black uppercase italic tracking-tighter">
              Inbound Archive Empty
            </p>
          </div>
        )}
      </div>

      {/* LIGHTBOX OVERLAY */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedPreview(null)}
            className="absolute top-12 right-12 h-14 w-14 rounded-full border-4"
          >
            <X className="w-8 h-8" />
          </Button>
          <div className="max-w-4xl w-full p-6 text-center space-y-8">
            <Image
              src={selectedPreview.url}
              alt={selectedPreview.name}
              className="max-h-[60vh] mx-auto rounded-[3rem] shadow-4xl border-8 border-white/5"
            />
            <div className="flex items-center justify-between bg-card p-8 rounded-[3rem] border-4 border-muted max-w-2xl mx-auto">
              <div className="text-left space-y-1">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                  {selectedPreview.name}
                </h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
                  {selectedPreview.mimeType}
                </p>
              </div>
              <a href={selectedPreview.url} download>
                <Button className="h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest">
                  <Download className="mr-2 h-4 w-4" /> Save Original
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
