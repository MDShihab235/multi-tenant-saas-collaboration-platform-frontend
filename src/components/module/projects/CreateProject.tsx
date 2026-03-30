"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { projectService } from "@/services/project.service";
import {
  FolderPlus,
  ArrowLeft,
  Layout,
  AlignLeft,
  Loader2,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function CreateProject() {
  const { orgSlug } = useParams();
  const router = useRouter();

  // In production, get this from your useOrg hook or context
  const orgId = "ACTUAL_ORG_ID_FROM_CONTEXT";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !orgId) return;

    setIsSubmitting(true);
    try {
      const newProject = await projectService.createProject(orgId, {
        name,
        description,
      });

      toast.success("Project Launched!", {
        description: `${name} has been created successfully.`,
      });

      // Redirect to the newly created project's overview
      router.push(`/${orgSlug}/projects/${newProject.id}`);
    } catch (error: any) {
      toast.error("Creation Failed", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      {/* Navigation */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="rounded-xl -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
      </Button>

      {/* Header */}
      <div className="space-y-2">
        <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
          <FolderPlus className="text-primary w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black tracking-tight">
          Create New Project
        </h1>
        <p className="text-muted-foreground font-medium">
          Set up a new workspace for your team&apos;s tasks and goals.
        </p>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-card border rounded-[2rem] p-8 shadow-sm space-y-6"
      >
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 flex items-center gap-2">
            <Layout className="w-3 h-3" /> Project Name
          </Label>
          <Input
            placeholder="e.g., Q4 Marketing Campaign"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 rounded-xl border-2 focus-visible:ring-primary font-medium"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 flex items-center gap-2">
            <AlignLeft className="w-3 h-3" /> Description (Optional)
          </Label>
          <Textarea
            placeholder="What is this project about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-30 rounded-xl border-2 resize-none focus-visible:ring-primary"
            disabled={isSubmitting}
          />
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full h-12 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Rocket className="w-5 h-5 mr-2" /> Launch Project
              </>
            )}
          </Button>
          <p className="text-[10px] text-center text-muted-foreground font-medium">
            As the creator, you will be automatically assigned as the **Owner**
            of this project.
          </p>
        </div>
      </form>
    </div>
  );
}
