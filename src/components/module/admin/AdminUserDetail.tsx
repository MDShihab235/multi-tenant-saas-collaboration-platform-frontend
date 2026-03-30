"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminService, UserDetail } from "@/services/admin.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ShieldAlert,
  Trash2,
  Key,
  Building2,
  UserCircle,
} from "lucide-react";

export default function AdminUserDetailPage() {
  const { userId } = useParams() as { userId: string };
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await adminService.getUserDetail(userId);
        setUser(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [userId]);

  const handleStatusUpdate = async (newStatus: "ACTIVE" | "BLOCKED") => {
    if (!user) return;
    const updated = await adminService.updateUserStatus(user.id, newStatus);
    setUser({ ...user, status: updated.status });
  };

  const handleForcePassword = async () => {
    if (confirm("Force this user to change their password on next login?")) {
      await adminService.forcePasswordReset(userId);
      alert("Password reset flag set.");
    }
  };

  const handleDelete = async () => {
    if (confirm("PERMANENTLY delete this user? This cannot be undone.")) {
      await adminService.hardDeleteUser(userId);
      router.push("/admin/users");
    }
  };

  if (loading) return <div className="p-8">Loading profile...</div>;
  if (!user) return <div className="p-8">User not found.</div>;

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleForcePassword}>
            <Key className="mr-2 h-4 w-4" /> Force PW Reset
          </Button>
          {user.status === "ACTIVE" ? (
            <Button
              variant="outline"
              className="text-orange-600"
              onClick={() => handleStatusUpdate("BLOCKED")}
            >
              <ShieldAlert className="mr-2 h-4 w-4" /> Block User
            </Button>
          ) : (
            <Button
              variant="outline"
              className="text-green-600"
              onClick={() => handleStatusUpdate("ACTIVE")}
            >
              Active User
            </Button>
          )}
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete Account
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Identity Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-4">
              <UserCircle className="w-12 h-12 text-primary" />
            </div>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <div className="mt-2 flex justify-center gap-2">
              <Badge>{user.role}</Badge>
              <Badge
                variant={user.status === "ACTIVE" ? "default" : "destructive"}
              >
                {user.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono text-xs">{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Joined</span>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Login</span>
              <span>{new Date(user.lastLoginAt).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Memberships Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Organization Memberships
            </CardTitle>
            <CardDescription>
              Organizations this user belongs to.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.memberships.length === 0 ? (
              <p className="text-muted-foreground italic">
                No memberships found.
              </p>
            ) : (
              <div className="space-y-4">
                {user.memberships.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-bold">{m.organization.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Slug: {m.organization.slug}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{m.role}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Plan: {m.organization.planId}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
