// src/app/(commonLayout)/(authRouteGroup)/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { FieldGroup } from "@/components/ui/field";

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize TanStack Form
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        await authService.login({
          email: value.email,
          password: value.password,
        });

        toast.success("Welcome back!", {
          description: "Successfully signed into your workspace.",
        });

        // Redirect to the dashboard upon successful login
        router.push("/dashboard");
      } catch (error: any) {
        toast.error("Sign in failed", {
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-primary/10 p-3 rounded-2xl mb-4 shadow-[0_0_30px_rgba(168,85,247,0.15)] ring-1 ring-primary/20">
            <Zap className="w-8 h-8 text-primary fill-current" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Welcome back
          </h1>
          <p className="text-muted-foreground">
            Enter your credentials to access your workspace.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card/50 backdrop-blur-xl border border-border shadow-2xl rounded-3xl p-6 sm:p-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="flex flex-col gap-5"
          >
            {/* Email Field */}
            <FieldGroup>
              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? "Email is required"
                      : !/^\S+@\S+\.\S+$/.test(value)
                        ? "Invalid email format"
                        : undefined,
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="work@company.com"
                        className="pl-9 bg-background/50 border-muted focus-visible:ring-primary h-11"
                        disabled={isLoading}
                      />
                    </div>
                    {field.state.meta.errors ? (
                      <span className="text-xs text-destructive pl-1">
                        {field.state.meta.errors.join(", ")}
                      </span>
                    ) : null}
                  </div>
                )}
              </form.Field>

              {/* Password Field */}
              <form.Field
                name="password"
                validators={{
                  onChange: ({ value }) =>
                    !value ? "Password is required" : undefined,
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-sm font-medium sr-only">
                        Password
                      </label>
                      {/* Forgot Password Link */}
                      <Link
                        href="/forgot-password"
                        className="text-xs font-semibold text-primary hover:underline ml-auto pb-1"
                        tabIndex={-1}
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="password"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Password"
                        className="pl-9 bg-background/50 border-muted focus-visible:ring-primary h-11"
                        disabled={isLoading}
                      />
                    </div>
                    {field.state.meta.errors ? (
                      <span className="text-xs text-destructive pl-1">
                        {field.state.meta.errors.join(", ")}
                      </span>
                    ) : null}
                  </div>
                )}
              </form.Field>

              {/* Submit Button */}
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isLoading}
                    className="w-full mt-4 h-11 font-semibold text-base shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </FieldGroup>
          </form>

          {/* Footer link */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
