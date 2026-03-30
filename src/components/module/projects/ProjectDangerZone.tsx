"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { projectService } from "@/services/project.service";
import { userService } from "@/services/user.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import {
  LogOut,
  Loader2,
  AlertCircle,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

export default function ProjectDangerZone() {
  const params = useParams();
  const router = useRouter();
  const projectSlug = params.projectSlug as string;

  const [project, setProject] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [projData, userData] = await Promise.all([
          projectService.getProjectBySlug(projectSlug),
          userService.getMe(),
        ]);
        setProject(projData);
        setCurrentUser(userData);
      } catch (err) {
        toast.error("Failed to load project security context.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [projectSlug]);

  const isOwner = project?.ownerId === currentUser?.id;

  const handleLeaveProject = async () => {
    setIsLeaving(true);
    try {
      await projectService.leaveProject(project.id);

      toast.success(`You have successfully left ${project.name}.`);

      // DATA FLOW: Redirect to project list on success
      router.push(`/${params.orgSlug}/projects`);
      router.refresh();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "An error occurred while leaving.",
      );
      setIsLeaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="-ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-destructive">
          Project Danger Zone
        </h1>
        <p className="text-muted-foreground">
          Irreversible actions for{" "}
          <span className="font-semibold text-foreground">{project?.name}</span>
          .
        </p>
      </header>

      {/* LEAVE PROJECT SECTION */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <LogOut className="h-5 w-5" /> Leave Project
          </CardTitle>
          <CardDescription>
            Voluntarily remove yourself from this project. You will lose access
            to all tasks and discussion history.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOwner ? (
            <div className="flex items-start gap-3 p-4 bg-white border border-amber-200 rounded-lg shadow-sm">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900 space-y-1">
                <p className="font-bold font-mono">OWNER_RESTRICTION_ACTIVE</p>
                <p>
                  As the project owner, you cannot leave. You must transfer
                  ownership to a Manager or delete the project entirely.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-white border rounded-xl">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold">Exit Workspace</p>
                <p className="text-xs text-muted-foreground">
                  You are currently a member of this project.
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-amber-200 hover:bg-amber-100 hover:text-amber-900"
                  >
                    Leave {project?.name}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-amber-600" />
                      Confirm Voluntary Exit
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>Are you sure you want to leave **{project?.name}**?</p>
                      <ul className="list-disc pl-5 text-xs space-y-1 text-muted-foreground">
                        <li>You will lose access to active tasks.</li>
                        <li>
                          You cannot rejoin without a new invite from an admin.
                        </li>
                        <li>
                          Existing tasks assigned to you will remain assigned to
                          you until someone else claims them.
                        </li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Stay in Project</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault();
                        handleLeaveProject();
                      }}
                      className="bg-amber-600 text-white hover:bg-amber-700"
                      disabled={isLeaving}
                    >
                      {isLeaving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <LogOut className="h-4 w-4 mr-2" />
                      )}
                      Confirm Leave
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Looking to delete the entire project? Only owners can see those
          options here.
        </p>
      </div>
    </div>
  );
}
