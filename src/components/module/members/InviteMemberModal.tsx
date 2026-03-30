"use client";

import { useEffect, useState } from "react";
import {
  organizationService,
  OrganizationRole,
} from "@/services/organization.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Shield, Loader2, SendHorizontal } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  onSuccess: () => void;
}

export function InviteMemberModal({
  isOpen,
  onClose,
  orgId,
  onSuccess,
}: Props) {
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState<OrganizationRole[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  useEffect(() => {
    if (isOpen && orgId) {
      const fetchRoles = async () => {
        try {
          const data = await organizationService.getOrganizationRoles(orgId);
          setRoles(data);
        } catch (err) {
          toast.error("Failed to load roles");
        } finally {
          setIsLoadingRoles(false);
        }
      };
      fetchRoles();
    }
  }, [isOpen, orgId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !roleId) return;

    setIsSubmitting(true);
    try {
      await organizationService.sendInvitation(orgId, { email, roleId });
      toast.success("Invitation Sent", {
        description: `An invite has been dispatched to ${email}.`,
      });
      setEmail("");
      setRoleId("");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Invite Failed", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-112.5 rounded-3xl p-8">
        <DialogHeader>
          <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
            <Mail className="text-primary w-6 h-6" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            Invite to Team
          </DialogTitle>
          <DialogDescription>
            Send a secure invitation link to a new team member.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleInvite} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/50" />
              <Input
                placeholder="colleague@company.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 rounded-xl focus-visible:ring-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
              Assign Role
            </Label>
            <Select
              onValueChange={setRoleId}
              value={roleId}
              disabled={isLoadingRoles}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue
                  placeholder={
                    isLoadingRoles ? "Loading roles..." : "Select a role"
                  }
                />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {roles.map((role) => (
                  <SelectItem
                    key={role.id}
                    value={role.id}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      <span>{role.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !email || !roleId}
              className="rounded-xl px-8 font-bold min-w-30"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <SendHorizontal className="w-4 h-4 mr-2" /> Send Invite
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
