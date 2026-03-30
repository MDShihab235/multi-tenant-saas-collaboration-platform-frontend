"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { projectService, Label } from "@/services/project.service";
import { LabelRow } from "@/components/module/projects/label-row";
import { Loader2, Tag } from "lucide-react";

export default function LabelsSettingsPage() {
  const params = useParams();
  const projectId = params.projectId as string; // Or resolve from slug

  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLabels = async () => {
      const data = await projectService.getLabels(projectId);
      setLabels(data);
      setLoading(false);
    };
    fetchLabels();
  }, [projectId]);

  const handleUpdateLocal = (updatedLabel: Label) => {
    setLabels((prev) =>
      prev.map((l) => (l.id === updatedLabel.id ? updatedLabel : l)),
    );
  };

  if (loading) return <Loader2 className="animate-spin m-10" />;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Tag className="h-5 w-5" /> Project Labels
        </h1>
        <p className="text-sm text-muted-foreground">
          Categorize tasks with custom names and colors.
        </p>
      </div>

      <div className="grid gap-3">
        {labels.map((label) => (
          <LabelRow
            key={label.id}
            label={label}
            projectId={projectId}
            onUpdate={handleUpdateLocal}
          />
        ))}
      </div>
    </div>
  );
}
