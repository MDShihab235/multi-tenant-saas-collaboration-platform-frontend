"use client";
import { useAuth } from "@/hooks/use-auth"; // Assuming you have an auth hook
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  invitationService,
  InvitationDetails,
} from "@/services/invitation.service";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  ShieldAlert,
  Loader2,
  Building2,
  ArrowRight,
  MailCheck,
} from "lucide-react";
import Link from "next/link";

export default function VerifyInvite() {
  const { token } = useParams();
  const router = useRouter();
  const [data, setData] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth(); // Your global auth state
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    const verify = async () => {
      const result = await invitationService.verifyInvitation(token as string);
      setData(result);
      setIsLoading(false);
    };
    verify();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">
          Verifying your invitation...
        </p>
      </div>
    );
  }

  // Error State: Invalid or Expired Token
  if (!data?.valid || !data.invitation) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-12">
        <div className="bg-destructive/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold">Link Expired</h1>
        <p className="text-muted-foreground">
          This invitation link is no longer valid or has already been used.
          Please ask your administrator for a new invite.
        </p>
        <Button asChild variant="outline" className="w-full h-12 rounded-xl">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  const handleAccept = async () => {
    if (!token || !data?.invitation) return;

    // 1. Check if user is logged in
    if (!isAuthenticated) {
      toast.info("Almost there!", {
        description: "Please create an account to join.",
      });
      router.push(`/register?email=${data.invitation.email}&token=${token}`);
      return;
    }

    // 2. Check if the logged-in user matches the invited email
    if (user?.email !== data.invitation.email) {
      toast.error("Account Mismatch", {
        description: `This invite was sent to ${data.invitation.email}. You are logged in as ${user?.email}.`,
      });
      return;
    }

    // 3. Process Acceptance
    setIsAccepting(true);
    try {
      await invitationService.acceptInvitation(token as string);
      toast.success("Welcome aboard!", {
        description: `You are now a member of ${data.invitation.orgName}`,
      });

      // Redirect to the new workspace
      router.push(`/${data.invitation.orgSlug}/overview`);
    } catch (error: any) {
      toast.error("Acceptance Failed", { description: error.message });
    } finally {
      setIsAccepting(false);
    }
  };

  const { orgName, role, email } = data.invitation;

  return (
    <div className="max-w-md mx-auto space-y-8 py-12">
      <div className="text-center space-y-4">
        <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto ring-1 ring-primary/20">
          <UserPlus className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          You&apos;ve been invited!
        </h1>
        <p className="text-muted-foreground">
          Join <span className="text-foreground font-bold">{orgName}</span> as a
          <span className="text-primary font-bold"> {role}</span>.
        </p>
      </div>

      <div className="bg-card border rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-5">
          <Building2 className="w-24 h-24" />
        </div>

        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-2xl border border-border/50">
            <MailCheck className="text-primary w-5 h-5" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                Invited Email
              </span>
              <span className="text-sm font-medium">{email}</span>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            By accepting, you agree to the organization&apos;s workspace
            policies.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-4">
          <Button
            className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
            onClick={() =>
              router.push(`/login?token=${token}&callback=accept-invite`)
            }
          >
            Accept & Join Workspace <ArrowRight className="ml-2 w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            className="w-full text-muted-foreground h-12"
            asChild
          >
            <Link href="/">Decline Invitation</Link>
          </Button>
        </div>
      </div>

      <p className="text-center text-[11px] text-muted-foreground uppercase tracking-widest">
        Secure Invite System &bull; Collab Pro Elite
      </p>
      <Button
        disabled={isAccepting}
        className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
        onClick={handleAccept}
      >
        {isAccepting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Accept & Join Workspace <ArrowRight className="ml-2 w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  );
}
