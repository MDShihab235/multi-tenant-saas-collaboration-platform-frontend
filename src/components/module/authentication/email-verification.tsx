"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { ShieldCheck, ArrowRight, Loader2, Mailbox } from "lucide-react";
import { FieldGroup } from "@/components/ui/field";

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 1. Try searchParams (Next.js way)
    const emailParam = searchParams.get("email");

    // 2. Fallback: Manual URL parsing (Vanilla JS way)
    const urlEmail = new URLSearchParams(window.location.search).get("email");

    const finalEmail = emailParam || urlEmail;

    if (finalEmail) {
      setEmail(decodeURIComponent(finalEmail));
    } else {
      // 3. If no email is found at all, redirect back to register
      toast.error("Session expired", {
        description: "Please register again to receive a code.",
      });
      router.push("/register");
    }
  }, [searchParams, router]);

  // Initialize TanStack Form
  const form = useForm({
    defaultValues: {
      otp: "",
    },
    onSubmit: async ({ value }) => {
      if (!email) {
        toast.error("Missing email address", {
          description: "Please restart the registration process.",
        });
        return;
      }

      setIsLoading(true);
      try {
        await authService.verifyEmail({
          email,
          otp: value.otp,
        });

        toast.success("Email verified!", {
          description: "Your Collab Pro workspace is ready.",
        });

        // Redirect to login or directly to dashboard based on your backend logic
        router.push("/login");
      } catch (error: any) {
        toast.error("Verification failed", {
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
          <div className="bg-primary/10 p-4 rounded-full mb-6 shadow-[0_0_40px_rgba(168,85,247,0.2)] ring-1 ring-primary/30">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            Check your email
          </h1>
          <p className="text-muted-foreground max-w-sm">
            We sent a 6-digit verification code to <br />
            <span className="font-semibold text-foreground">
              {email || "your email address"}
            </span>
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card/50 backdrop-blur-xl border border-border shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col items-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="flex flex-col gap-6 w-full items-center"
          >
            {/* OTP Field using input-otp */}
            <FieldGroup>
              <form.Field
                name="otp"
                validators={{
                  onChange: ({ value }) =>
                    value.length < 6 ? "Please enter all 6 digits" : undefined,
                }}
              >
                {(field) => (
                  <div className="flex flex-col items-center gap-2 w-full">
                    <InputOTP
                      maxLength={6}
                      value={field.state.value}
                      onChange={(value) => field.handleChange(value)}
                      disabled={isLoading}
                      autoFocus
                    >
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={0}
                          className="w-12 h-14 text-lg border-muted bg-background/50"
                        />
                        <InputOTPSlot
                          index={1}
                          className="w-12 h-14 text-lg border-muted bg-background/50"
                        />
                        <InputOTPSlot
                          index={2}
                          className="w-12 h-14 text-lg border-muted bg-background/50"
                        />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={3}
                          className="w-12 h-14 text-lg border-muted bg-background/50"
                        />
                        <InputOTPSlot
                          index={4}
                          className="w-12 h-14 text-lg border-muted bg-background/50"
                        />
                        <InputOTPSlot
                          index={5}
                          className="w-12 h-14 text-lg border-muted bg-background/50"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                    {field.state.meta.errors ? (
                      <span className="text-xs text-destructive mt-1">
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
                    className="w-full mt-4 h-12 font-semibold text-base shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify Account <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </FieldGroup>
          </form>

          {/* Resend Action */}
          <div className="mt-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Mailbox className="w-4 h-4" />
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              className="font-semibold text-primary hover:underline"
              onClick={() => toast.info("New code sent to your email.")}
              disabled={isLoading}
            >
              Resend
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
