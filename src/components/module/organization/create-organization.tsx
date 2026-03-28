"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { organizationService } from "@/services/organization.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Globe, ArrowRight, Loader2, Info } from "lucide-react";
import { FieldGroup } from "@/components/ui/field";

export default function CreateOrganization() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Helper to slugify text
  // Helper to perfectly match your backend Zod Regex
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim() // 1. Remove leading/trailing spaces
      .replace(/[^a-z0-9\s-]/g, "") // 2. Remove anything that isn't a-z, 0-9, space, or hyphen
      .replace(/\s+/g, "-") // 3. Replace spaces with hyphens
      .replace(/-+/g, "-") // 4. Replace multiple hyphens with a single hyphen
      .replace(/^-+|-+$/g, ""); // 5. Strip leading/trailing hyphens (Crucial for Zod!)

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        await organizationService.create(value);
        toast.success("Workspace Created!", {
          description: `Welcome to ${value.name}. Redirecting to dashboard...`,
        });
        router.push("/dashboard");
      } catch (error: any) {
        toast.error("Error", { description: error.message });
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Branding/Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4 ring-1 ring-primary/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create your workspace
          </h1>
          <p className="text-muted-foreground mt-2">
            This is where your team will collaborate and manage projects.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border shadow-2xl rounded-3xl p-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            {/* Organization Name */}
            <FieldGroup>
              <form.Field
                name="name"
                validators={{
                  onChange: ({ value }) =>
                    !value ? "Name is required" : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold pl-1">
                      Organization Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Acme Corp"
                        className="pl-9 h-12 bg-background/50 border-muted focus-visible:ring-primary"
                        value={field.state.value}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                          // Auto-sync slug if the user hasn't modified it manually
                          form.setFieldValue("slug", slugify(e.target.value));
                        }}
                      />
                    </div>
                  </div>
                )}
              </form.Field>

              {/* Workspace Slug */}
              <form.Field
                name="slug"
                validators={{
                  onChange: ({ value }) =>
                    !value ? "Slug is required" : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pl-1">
                      <label className="text-sm font-semibold">
                        Workspace URL
                      </label>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        Permanent
                      </span>
                    </div>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="acme-corp"
                        className="pl-9 h-12 bg-background/50 border-muted focus-visible:ring-primary font-mono text-sm"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(slugify(e.target.value))
                        }
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        .collabpro.com
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 px-1">
                      <Info className="w-3 h-3" />
                      Only lowercase letters, numbers, and hyphens allowed.
                    </p>
                  </div>
                )}
              </form.Field>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Launch Workspace <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </FieldGroup>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          By creating a workspace, you agree to Collab Pro&apos;s <br />
          <a href="#" className="underline hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-primary">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
