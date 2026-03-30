"use client";

import { useEffect, useState, useCallback } from "react";
import { projectService, Project } from "@/services/project.service";
import {
  FolderKanban,
  Search,
  Plus,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Users2,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { debounce } from "lodash";
import { toast } from "sonner";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const orgId = "ACTUAL_ORG_ID"; // Get from context

  const fetchProjects = async (currentPage: number, searchTerm: string) => {
    try {
      setLoading(true);
      const data = await projectService.getProjects(
        orgId,
        currentPage,
        9,
        searchTerm,
      );
      setProjects(data.projects);
      setTotalPages(data.pages);
    } catch (error: any) {
      toast.error("Error", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Debounced search to prevent API spam
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setPage(1);
      fetchProjects(1, term);
    }, 400),
    [],
  );

  useEffect(() => {
    fetchProjects(page, search);
  }, [page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FolderKanban className="w-8 h-8 text-primary" /> Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization&apos;s workspaces and initiatives.
          </p>
        </div>
        <Button className="rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5 mr-2" /> New Project
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 bg-card p-2 rounded-[2rem] border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by name..."
            value={search}
            onChange={handleSearchChange}
            className="pl-11 h-12 border-none bg-transparent focus-visible:ring-0 text-sm"
          />
        </div>
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary w-10 h-10" />
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group bg-card border rounded-[2rem] p-6 hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-primary/5 p-3 rounded-2xl">
                  <FolderKanban className="w-6 h-6 text-primary" />
                </div>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-6 min-h-10">
                {project.description ||
                  "No description provided for this project."}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-muted/50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    {project._count.tasks} Tasks
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                    <Users2 className="w-4 h-4 text-blue-500" />
                    {project._count.members}
                  </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                  Active
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-[3rem] bg-muted/5">
          <FolderKanban className="w-12 h-12 text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground font-medium">
            No projects found.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-bold px-4">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
