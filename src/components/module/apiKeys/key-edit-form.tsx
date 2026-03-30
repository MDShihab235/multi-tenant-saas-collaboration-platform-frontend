"use client";

import { useState } from "react";
import { apiKeyService, ApiKey } from "@/services/api-key.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface KeyEditFormProps {
  apiKey: ApiKey;
  orgId: string;
  onSuccess: (updatedKey: ApiKey) => void;
}

export function KeyEditForm({ apiKey, orgId, onSuccess }: KeyEditFormProps) {
  const [name, setName] = useState(apiKey.name);
  const [expiry, setExpiry] = useState(
    apiKey.expiresAt ? apiKey.expiresAt.split("T")[0] : "",
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const updated = await apiKeyService.updateKeyMetadata(orgId, apiKey.id, {
        name,
        expiresAt: expiry || null,
      });
      toast.success("Metadata Synchronized", {
        description: "Integration labels and TTL updated successfully.",
      });
      onSuccess(updated);
    } catch (err) {
      toast.error("Update Denied", {
        description: "You lack the permissions to modify this credential.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      {/* NAME FIELD */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
          Internal Label
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-2xl border-2 h-12 font-bold focus-visible:ring-primary/20"
        />
      </div>

      {/* EXPIRY FIELD */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
          <Calendar className="w-3 h-3" /> Expiration Protocol
        </label>
        <Input
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className="rounded-2xl border-2 h-12 font-bold uppercase text-[10px] tracking-widest"
        />
      </div>

      <Button
        onClick={handleUpdate}
        disabled={isUpdating}
        className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/10"
      >
        {isUpdating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        Update Metadata
      </Button>
    </div>
  );
}
