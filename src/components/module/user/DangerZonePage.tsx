"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";

export default function DangerZonePage() {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") return;

    setIsDeleting(true);
    try {
      await authService.deleteAccount();

      toast.success("Account deactivated. We're sorry to see you go.");

      // Clear all local state
      localStorage.clear();

      // Redirect to landing page/homepage
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 2000);
    } catch (error) {
      toast.error("Failed to delete account. Please contact support.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Danger Zone</h1>
        <p className="text-muted-foreground">
          Irreversible actions and account termination.
        </p>
      </div>

      <Card className="border-destructive/50 bg-destructive/[0.02]">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-5 w-5" />
            <CardTitle>Delete Account</CardTitle>
          </div>
          <CardDescription className="text-destructive/80">
            Once you delete your account, you will lose access to all
            organizations and data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-background border rounded-lg p-4 space-y-3">
            <div className="flex gap-3 text-sm">
              <Info className="h-5 w-5 text-blue-500 shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold">What happens next?</p>
                <ul className="list-disc pl-4 text-muted-foreground space-y-1 text-xs">
                  <li>
                    Your active subscription will be canceled immediately.
                  </li>
                  <li>All active login sessions will be revoked.</li>
                  <li>
                    Your profile will be hidden from other organization members.
                  </li>
                  <li>
                    You can contact support within 30 days if this was a
                    mistake.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-sm font-medium">
                To confirm, type{" "}
                <span className="font-bold text-foreground">DELETE</span> below:
              </Label>
              <Input
                id="confirm"
                placeholder="DELETE"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="border-destructive/20 focus-visible:ring-destructive"
              />
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={confirmText !== "DELETE"}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Permanently Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-destructive h-5 w-5" />
                    Final Confirmation
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action is final. Your data will be marked for deletion
                    and your sessions will be purged. Are you absolutely sure?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteAccount();
                    }}
                    className="bg-destructive text-white hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Confirm Deletion"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
