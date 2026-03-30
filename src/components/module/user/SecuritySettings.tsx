"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/user.service";
import { authService, Session } from "@/services/auth.service";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  ShieldCheck,
  KeyRound,
  Loader2,
  AlertTriangle,
  LogOut,
  Fingerprint,
  ShieldAlert,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function SecuritySettingsPage() {
  const router = useRouter();

  // --- States ---
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Password Visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Form State
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // --- Actions ---
  const loadSessions = async () => {
    try {
      const data = await authService.getSessions();
      setSessions(data);
    } catch (err) {
      toast.error("Failed to load active sessions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    setIsPending(true);
    try {
      await userService.changePassword(passwords);
      toast.success("Password updated. All other sessions revoked.");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      loadSessions(); // Refresh list as other sessions are now gone
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Verification failed.");
    } finally {
      setIsPending(false);
    }
  };

  const handleRevokeSingle = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      await authService.revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Device signed out.");
    } catch (err) {
      toast.error("Failed to revoke session.");
    } finally {
      setRevokingId(null);
    }
  };

  const handleSignOutEverywhere = async () => {
    setIsPending(true);
    try {
      await authService.revokeAllSessions();
      toast.success("All sessions cleared. Redirecting...");
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 1000);
    } catch (err) {
      toast.error("Global sign-out failed.");
      setIsPending(false);
    }
  };

  const getDeviceIcon = (type: Session["deviceType"]) => {
    switch (type) {
      case "desktop":
        return <Monitor className="h-4 w-4" />;
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10 pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Security & Privacy
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your credentials and monitor active device access.
        </p>
      </header>

      {/* 1. PASSWORD SECTION */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" /> Update Password
          </CardTitle>
          <CardDescription>
            Changing your password will automatically sign you out of all other
            devices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      currentPassword: e.target.value,
                    })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrent ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        newPassword: e.target.value,
                      })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNew ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirm New</Label>
                <Input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full md:w-auto"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Save New Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 2. SESSIONS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Fingerprint className="h-5 w-5" /> Active Device Sessions
          </h2>
          <Badge variant="outline" className="font-mono">
            {sessions.length} Active
          </Badge>
        </div>
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="animate-spin mx-auto h-6 w-6 text-muted-foreground" />
              </div>
            ) : (
              <div className="divide-y">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between p-4 ${s.isCurrent && "bg-primary/[0.03]"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-full ${s.isCurrent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                      >
                        {getDeviceIcon(s.deviceType)}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold truncate max-w-[250px]">
                            {s.userAgent}
                          </span>
                          {s.isCurrent && (
                            <Badge className="text-[10px] h-4 bg-green-500/10 text-green-700 hover:bg-green-500/10 border-none">
                              Current Device
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" /> {s.ipAddress}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />{" "}
                            {formatDistanceToNow(new Date(s.lastUsedAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!s.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSingle(s.id)}
                        disabled={revokingId === s.id}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        {revokingId === s.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LogOut className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. DANGER ZONE (GLOBAL LOGOUT) */}
      <Card className="border-destructive/20 bg-destructive/[0.01]">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2 text-lg">
            <ShieldAlert className="h-5 w-5" /> Account Lockdown
          </CardTitle>
          <CardDescription>
            Immediately terminate every active session, including this one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full md:w-auto">
                Sign Out of All Devices
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Force Global Sign-Out?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will kill every active connection to your account. You
                  will be redirected to the login page and must sign back in on
                  this device.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSignOutEverywhere}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Confirm Lockdown
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
