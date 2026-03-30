"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  organizationService,
  Membership,
} from "@/services/organization.service";
import {
  ArrowLeft,
  Mail,
  Shield,
  Calendar,
  UserMinus,
  Loader2,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function MemberDetails() {
  const { orgSlug, userId } = useParams();
  const router = useRouter();
  const [member, setMember] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);

  // In production, get this from your useOrg hook
  const orgId = "ACTUAL_ORG_ID_FROM_CONTEXT";

  useEffect(() => {
    const fetchDetail = async () => {
      if (!orgId || !userId) return;
      try {
        const data = await organizationService.getMembershipDetail(
          orgId,
          userId as string,
        );
        setMember(data);
      } catch (error: any) {
        toast.error("Error", { description: error.message });
        router.push(`/${orgSlug}/members`);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [orgId, userId, orgSlug, router]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  if (!member) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Navigation */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="rounded-xl -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Members
      </Button>

      {/* Profile Header Card */}
      <div className="bg-card border rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
          <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-primary/20">
            {member.role.name}
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
            <AvatarImage src={member.user.image} />
            <AvatarFallback className="text-4xl bg-primary/10 text-primary font-bold">
              {member.user.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight">
              {member.user.name}
            </h1>
            <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-4 h-4" /> {member.user.email}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-xl">
                <Calendar className="w-3.5 h-3.5" />
                Joined {new Date(member.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-xl">
                <Shield className="w-3.5 h-3.5" />
                ID: {member.userId.slice(0, 8)}...
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-3xl p-6 space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary" /> Access Control
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Update this user&apos;s role to change their permissions across the
            entire organization.
          </p>
          <Button
            className="w-full rounded-xl font-bold py-6 border-2 border-primary/10"
            variant="outline"
          >
            Change User Role
          </Button>
        </div>

        <div className="bg-destructive/5 border border-destructive/10 rounded-3xl p-6 space-y-4">
          <h3 className="font-bold flex items-center gap-2 text-destructive">
            <UserMinus className="w-4 h-4" /> Danger Zone
          </h3>
          <p className="text-sm text-destructive/70 leading-relaxed">
            Removing this user will immediately revoke their access to all
            organization resources.
          </p>
          <Button
            variant="destructive"
            className="w-full rounded-xl font-bold py-6"
          >
            Remove from Organization
          </Button>
        </div>
      </div>

      {/* Activity Placeholder */}
      <div className="pt-8 border-t">
        <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
          Recent Activity
          <Button variant="ghost" size="sm" className="text-xs">
            View All <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-transparent hover:border-muted-foreground/10 transition-colors"
            >
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="font-medium text-muted-foreground">
                  Modified project settings
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">
                2 hours ago
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
