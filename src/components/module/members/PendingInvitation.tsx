"use client";

import { useEffect, useState } from "react";
import {
  organizationService,
  PendingInvitation,
} from "@/services/organization.service";
import {
  Mail,
  Clock,
  Trash2,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  orgId: string;
  refreshTrigger: number;
}

export function PendingInvitations({ orgId, refreshTrigger }: Props) {
  const [invites, setInvites] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchInvites = async () => {
    if (!orgId) return;
    try {
      const data = await organizationService.getPendingInvitations(orgId);
      setInvites(data);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, [orgId, refreshTrigger]);

  const handleRevoke = async (inviteId: string) => {
    setRevokingId(inviteId);
    try {
      await organizationService.revokeInvitation(inviteId);
      toast.success("Invitation Revoked", {
        description: "The signup link is now invalid.",
      });
      fetchInvites(); // Refresh the list
    } catch (error: any) {
      toast.error("Error", { description: error.message });
    } finally {
      setRevokingId(null);
    }
  };

  if (loading)
    return (
      <div className="py-20 flex justify-center italic text-muted-foreground gap-2 items-center">
        <Loader2 className="animate-spin w-4 h-4" /> Loading invitations...
      </div>
    );

  if (invites.length === 0) {
    return (
      <div className="py-20 text-center border-2 border-dashed rounded-[2rem] bg-muted/5">
        <Mail className="w-10 h-10 mx-auto text-muted-foreground/20 mb-3" />
        <p className="text-muted-foreground text-sm font-medium">
          No pending invitations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between p-5 bg-card border rounded-2xl hover:border-primary/20 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none mb-1.5">
                  {invite.email}
                </p>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded-md border tracking-tighter">
                    <ShieldCheck className="w-2.5 h-2.5" /> {invite.role.name}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600/80">
                    <Clock className="w-3 h-3" />
                    Expires {new Date(invite.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              disabled={revokingId === invite.id}
              className="text-destructive hover:bg-destructive/10 rounded-xl px-4 h-9 font-bold transition-colors"
              onClick={() => handleRevoke(invite.id)}
            >
              {revokingId === invite.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" /> Revoke
                </>
              )}
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 p-4 bg-primary/3 border border-primary/10 rounded-2xl text-[11px] leading-relaxed text-muted-foreground">
        <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p>
          Revoking an invitation will immediately disable the link sent to the
          user. If they try to use it, they will be met with an &quot;Expired or
          Invalid Link&quot; error.
        </p>
      </div>
    </div>
  );
}
