"use client";

import { useState, useEffect } from "react";
import { userService, UserProfile } from "@/services/user.service";
import { fileService } from "@/services/file.service";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, User, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ProfileSettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    image: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getMe(); // Existing GET /users/me
        setUser(data);
        setFormData({ name: data.name, image: data.image || "" });
      } catch (err) {
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Assuming POST /files/upload returns { url: string }
      const { url } = await fileService.uploadFile(file);
      setFormData((prev) => ({ ...prev, image: url }));
      toast.success("Avatar uploaded! Save to apply changes.");
    } catch (err) {
      toast.error("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updatedUser = await userService.updateMe(formData);
      setUser(updatedUser);

      // OPTIMISTIC SYNC: Dispatch a custom event or update global Auth state
      // so the Navbar/Sidebar updates instantly without a refresh.
      window.dispatchEvent(
        new CustomEvent("user-profile-updated", { detail: updatedUser }),
      );

      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error("Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-12 text-center text-muted-foreground">
        Loading profile...
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your public profile and identity.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Public Profile</CardTitle>
            <CardDescription>
              This information will be visible to other members of your
              organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 border-2 border-muted">
                <AvatarImage src={formData.image} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {formData.name?.charAt(0).toUpperCase() || <User />}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors">
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">Change Photo</span>
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </Label>
                <p className="text-xs text-muted-foreground">
                  JPG, GIF or PNG. Max size 2MB.
                </p>
              </div>
            </div>

            <Separator />

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter your name"
                required
              />
            </div>

            {/* Read-only Email */}
            <div className="space-y-2 opacity-70">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={user?.email}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-foreground italic">
                Email changes require security verification. Contact support.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={saving || uploading}
                className="min-w-[120px]"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

function Separator() {
  return <div className="h-px w-full bg-border" />;
}
