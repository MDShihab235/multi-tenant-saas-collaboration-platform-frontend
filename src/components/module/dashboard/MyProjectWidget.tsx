"use client";

import { useEffect, useState } from "react";
import { projectService, MyProject } from "@/services/project.service";
import {
  Briefcase,
  ChevronRight,
  Layers,
  Users,
  ArrowUpRight,
  Loader2,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"; // Assuming shadcn progress

export function MyProjectsWidget() {
  const [projects, setProjects] = useState<MyProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await projectService.getMyProjects();
        setProjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <div className="bg-card border rounded-[2rem] p-8 flex items-center justify-center min-h-100">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );

  return (
    <div className="bg-card border rounded-[2rem] overflow-hidden shadow-sm">
      <div className="p-6 border-b flex items-center justify-between bg-muted/5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-bold text-lg">My Projects</h2>
        </div>
        <Link
          href="/dashboard/projects"
          className="text-xs font-bold text-primary hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="divide-y">
        {projects.length > 0 ? (
          projects.slice(0, 5).map((project) => (
            <Link
              key={project.id}
              href={`/${project.organization.slug}/projects/${project.id}`}
              className="block p-5 hover:bg-muted/30 transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm group-hover:text-primary transition-colors flex items-center gap-2">
                    {project.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                    <Building2 className="w-3 h-3" />
                    {project.organization.name}
                  </div>
                </div>

                <div className="flex -space-x-2">
                  {/* Visual representation of task density */}
                  <div className="px-2 py-1 rounded-lg bg-primary/5 border border-primary/10 text-[10px] font-black text-primary">
                    {project._count.tasks} TASKS
                  </div>
                </div>
              </div>

              {/* Simple Progress Visualization */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] font-bold text-muted-foreground uppercase">
                  <span>Progress</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="h-1.5" />
              </div>
            </Link>
          ))
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            <Layers className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">
              You haven&apos;t joined any projects yet.
            </p>
          </div>
        )}
      </div>

      {projects.length > 5 && (
        <div className="p-4 bg-muted/10 text-center border-t">
          <p className="text-[10px] text-muted-foreground font-bold italic">
            + {projects.length - 5} more projects across your organizations
          </p>
        </div>
      )}
    </div>
  );
}
