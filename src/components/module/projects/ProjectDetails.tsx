"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  projectService,
  ProjectDetail,
  ProjectStats,
} from "@/services/project.service";
import {
  LayoutGrid,
  ArrowLeft,
  Loader2,
  Calendar,
  Target,
  Plus,
  Filter,
  Activity,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Internal Components
import { ProjectStatsGrid } from "@/components/module/projects/ProjectsStatsGrid";
import { ProjectMemberList } from "@/components/module/projects/ProjectMemberList";
import { ProjectLabels } from "@/components/module/projects/ProjectLabels";
import { CreateTaskModal } from "@/components/module/projects/CreateTaskModal";
import { KanbanBoard } from "@/components/module/projects/KanbanBoard";

export default function ProjectDetailPage() {
  const { orgSlug, projectId } = useParams();
  const router = useRouter();

  // State Management
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLabelId, setSelectedLabelId] = useState<string | undefined>();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Used to force-refresh the KanbanBoard

  // Context Mock - In production, use your useOrg() or Auth context
  const orgId = "ACTUAL_ORG_ID_FROM_CONTEXT";

  const fetchData = useCallback(async () => {
    if (!orgId || !projectId) return;
    try {
      const [detailData, statsData] = await Promise.all([
        projectService.getProjectDetail(orgId, projectId as string),
        projectService.getProjectStats(orgId, projectId as string),
      ]);
      setProject(detailData);
      setStats(statsData);
      setRefreshKey((prev) => prev + 1); // Trigger Kanban reload
    } catch (error: any) {
      toast.error("Project Error", { description: error.message });
      router.push(`/${orgSlug}/projects`);
    } finally {
      setLoading(false);
    }
  }, [orgId, projectId, orgSlug, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <Loader2 className="animate-spin text-primary w-12 h-12" />
          <Target className="absolute inset-0 m-auto w-5 h-5 text-primary/50" />
        </div>
        <p className="text-sm font-black text-muted-foreground animate-pulse tracking-[0.3em] uppercase">
          Initializing Workspace
        </p>
      </div>
    );
  }

  if (!project || !stats) return null;

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-10">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col gap-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/${orgSlug}/projects`)}
          className="w-fit -ml-3 text-muted-foreground hover:text-foreground rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-start gap-5">
            <div className="bg-primary/10 p-4 rounded-[2.5rem] shadow-sm shrink-0 border border-primary/20">
              <Target className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
                {project.name}
              </h1>
              <p className="text-muted-foreground font-medium text-lg max-w-2xl line-clamp-1">
                {project.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* Project Summary Card */}
          <div className="bg-card border-2 border-muted/50 rounded-[2.5rem] p-5 px-8 shadow-sm flex items-center gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                Active Team
              </p>
              <div className="flex items-center -space-x-3">
                {project.projectMembers.slice(0, 4).map((m) => (
                  <Avatar
                    key={m.userId}
                    className="border-[3px] border-background h-10 w-10 shadow-sm"
                  >
                    <AvatarImage src={m.user.image} />
                    <AvatarFallback className="bg-muted text-[10px] font-bold">
                      {m.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {project._count.members > 4 && (
                  <div className="h-10 w-10 rounded-full bg-muted border-[3px] border-background flex items-center justify-center text-[10px] font-black">
                    +{project._count.members - 4}
                  </div>
                )}
              </div>
            </div>
            <div className="h-12 w-px bg-muted" />
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                Health
              </p>
              <p className="text-xs font-black flex items-center gap-2 text-green-500">
                <Activity className="w-4 h-4" /> Optimized
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Global Performance Stats */}
      <section className="space-y-4">
        <ProjectStatsGrid stats={stats} />
      </section>

      {/* 3. Operational Tabs */}
      <Tabs defaultValue="tasks" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-muted pb-0.5">
          <TabsList className="bg-transparent h-auto p-0 gap-10">
            <TabsTrigger
              value="tasks"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-[4px] data-[state=active]:border-primary rounded-none px-0 pb-4 font-black text-sm uppercase tracking-widest transition-all"
            >
              Kanban Board
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-[4px] data-[state=active]:border-primary rounded-none px-0 pb-4 font-black text-sm uppercase tracking-widest transition-all"
            >
              Team Roster
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-[4px] data-[state=active]:border-primary rounded-none px-0 pb-4 font-black text-sm uppercase tracking-widest transition-all"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <Button
            onClick={() => setIsTaskModalOpen(true)}
            className="rounded-2xl h-12 px-8 font-black text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Task
          </Button>
        </div>

        {/* --- Tab Content: Tasks (The Kanban Board) --- */}
        <TabsContent value="tasks" className="mt-0 outline-none space-y-8">
          {/* Toolbar: Search & Labels */}
          <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
            <div className="bg-card border-2 border-muted/50 p-4 px-6 rounded-[2rem] shadow-sm flex flex-col md:flex-row md:items-center gap-6 w-full xl:w-auto">
              <div className="flex items-center gap-2 text-primary bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
                <Filter className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase">
                  Filter by Label
                </span>
              </div>
              <ProjectLabels
                projectId={projectId as string}
                selectedLabelId={selectedLabelId}
                onSelect={(id) =>
                  setSelectedLabelId(id === selectedLabelId ? undefined : id)
                }
              />
            </div>

            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search board..."
                className="pl-11 h-12 rounded-2xl border-2 border-muted focus-visible:ring-primary bg-background font-bold"
              />
            </div>
          </div>

          {/* Real Kanban Content */}
          <KanbanBoard
            key={refreshKey} // Forces re-mount when a task is added
            projectId={projectId as string}
            selectedLabelId={selectedLabelId}
          />
        </TabsContent>

        {/* --- Tab Content: Team --- */}
        <TabsContent value="members" className="mt-0 outline-none">
          <ProjectMemberList projectId={projectId as string} orgId={orgId} />
        </TabsContent>

        {/* --- Tab Content: Settings --- */}
        <TabsContent value="settings" className="mt-0 outline-none">
          <div className="bg-card border-2 rounded-[3.5rem] p-24 text-center border-dashed">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-10" />
            <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-sm">
              General Settings Panel
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        projectId={projectId as string}
        onSuccess={fetchData} // Updates stats + refreshes board
      />
    </div>
  );
}
