"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  organizationService,
  Organization,
} from "@/services/organization.service";
import { membershipService } from "@/services/membership.service";
import { userService, UserProfile } from "@/services/user.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AlertTriangle,
  Trash2,
  Loader2,
  ShieldAlert,
  LogOut,
  Skull,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export default function OrgDangerZonePage() {
  const router = useRouter();
  const params = useParams();
  const orgSlug = params.orgSlug as string;

  const [org, setOrg] = useState<Organization | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Action States
  const [confirmText, setConfirmText] = useState("");
  const [isPending, setIsPending] = useState(false);

  const isOwner = org?.ownerId === user?.id;
  const deleteTarget = `DELETE ${org?.name?.toUpperCase()}`;

  useEffect(() => {
    const init = async () => {
      try {
        const [orgData, userData] = await Promise.all([
          organizationService.getOrganizationBySlug(orgSlug),
          userService.getMe(),
        ]);
        setOrg(orgData);
        setUser(userData);
      } catch (err) {
        toast.error("Failed to load security context.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [orgSlug]);

  const handleLeave = async () => {
    setIsPending(true);
    try {
      await membershipService.leaveOrganization(org!.id);
      toast.success(`You have left ${org?.name}.`);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error("Failed to leave organization.");
      setIsPending(false);
    }
  };

  const handleDelete = async () => {
    setIsPending(true);
    try {
      await organizationService.deleteOrganization(org!.id);
      toast.success("Organization permanently deleted.");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error("Deletion failed. Internal server error.");
      setIsPending(false);
    }
  };

  if (loading)
    return (
      <div className="p-12 text-center">
        <Loader2 className="animate-spin mx-auto h-8 w-8 text-muted-foreground" />
      </div>
    );

  return (
    <div className="max-w-3xl space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-destructive">
          Danger Zone
        </h1>
        <p className="text-muted-foreground">
          High-impact actions for the workspace{" "}
          <span className="font-semibold text-foreground">{org?.name}</span>.
        </p>
      </header>

      {/* SECTION 1: LEAVE ORGANIZATION (Members Only) */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <LogOut className="h-5 w-5" /> Leave Workspace
          </CardTitle>
          <CardDescription>
            Exit this organization and lose access to all its resources.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isOwner ? (
            <div className="flex items-start gap-3 p-4 bg-white border border-amber-200 rounded-lg text-sm text-amber-900">
              <Info className="h-5 w-5 shrink-0 text-amber-600" />
              <p>
                As the **Owner**, you cannot leave this workspace. You must
                transfer ownership to another member or delete the organization.
              </p>
            </div>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-amber-200 hover:bg-amber-100"
                >
                  Leave {org?.name}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will lose access to all projects, files, and chats
                    within **{org?.name}**. You&apos;ll need a new invite to
                    rejoin.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLeave}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    {isPending ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      "Confirm Leave"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardContent>
      </Card>

      {/* SECTION 2: DELETE ORGANIZATION (Owner Only) */}
      {isOwner && (
        <Card className="border-destructive/30 bg-destructive/[0.02]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Skull className="h-5 w-5" /> Delete Workspace
            </CardTitle>
            <CardDescription className="font-medium text-destructive/80">
              Permanently purge this organization and all its cascaded data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-background border-2 border-destructive/10 rounded-xl space-y-2 text-xs text-muted-foreground">
              <p className="font-bold text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> PERMANENT ACTIONS:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>All {org?.name} data will be erased from our servers.</li>
                <li>Member access is revoked immediately.</li>
                <li>Subscriptions and billing will be terminated.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Label className="text-sm">
                Type{" "}
                <span className="font-mono font-bold select-all bg-muted px-1">
                  {deleteTarget}
                </span>{" "}
                to confirm:
              </Label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={deleteTarget}
                className="font-mono border-destructive/20 focus-visible:ring-destructive"
              />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full font-bold"
                    disabled={confirmText !== deleteTarget}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Destroy Everything
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                      <ShieldAlert className="h-6 w-6" /> Final Confirmation
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This is irreversible. You are about to destroy **
                      {org?.name}**. All files and history will be purged.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isPending ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        "Delete Workspace"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
