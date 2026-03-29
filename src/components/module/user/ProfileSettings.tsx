"use client";

import { useEffect, useState } from "react";
import { userService, UserProfile } from "@/services/user.service";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { User, Mail, Briefcase, Loader2, Save } from "lucide-react";

export default function ProfileSettings() {
  const { setUser } = useAuth(); // To update global state after save
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await userService.getMe();
        setProfile(data);
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await userService.updateProfile(profile);
      setUser(updated); // Sync Zustand store
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your public profile and personal information.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-6 bg-card border rounded-3xl p-8 shadow-sm"
      >
        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Full Name
            </label>
            <Input
              value={profile.name || ""}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="John Doe"
              className="rounded-xl"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" /> Email Address
            </label>
            <Input
              value={profile.email || ""}
              disabled
              className="rounded-xl bg-muted/50 opacity-70"
            />
            <p className="text-[10px] text-muted-foreground italic">
              Email changes require identity verification.
            </p>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" /> Job Title
            </label>
            <Input
              value={profile.jobTitle || ""}
              onChange={(e) =>
                setProfile({ ...profile, jobTitle: e.target.value })
              }
              placeholder="Lead Designer"
              className="rounded-xl"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSaving}
          className="w-full md:w-auto px-8 rounded-xl font-bold"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </form>
    </div>
  );
}
