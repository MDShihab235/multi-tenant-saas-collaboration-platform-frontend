"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  const [status, setStatus] = useState<"processing" | "confirmed" | "error">(
    "processing",
  );
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();

  const sessionId = searchParams.get("session_id");
  const orgId = params.orgId as string;

  useEffect(() => {
    if (!sessionId || !orgId) return;

    // Polling logic to check if the Webhook has updated our DB
    const checkStatus = setInterval(async () => {
      try {
        // We fetch the subscription status for this specific organization
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/subscription/${orgId}`,
          {
            headers: {
              // Ensure you include your auth token here if the route is protected
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        const result = await res.json();

        // If status in our DB is ACTIVE, the webhook has finished its job
        if (result.success && result.data.status === "ACTIVE") {
          setStatus("confirmed");
          clearInterval(checkStatus);

          // Redirect to the organization dashboard after a short delay
          setTimeout(() => {
            router.push(`/${orgId}`);
          }, 4000);
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        // We don't set error immediately because the webhook might just be slow
      }
    }, 2000);

    // Stop polling after 30 seconds to prevent infinite loops if webhook fails
    const timeout = setTimeout(() => {
      clearInterval(checkStatus);
      if (status === "processing") setStatus("error");
    }, 30000);

    return () => {
      clearInterval(checkStatus);
      clearTimeout(timeout);
    };
  }, [sessionId, orgId, router, status]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
      <div className="max-w-md w-full p-8 bg-white shadow-xl rounded-2xl text-center border border-slate-100">
        {status === "processing" && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Verifying Payment
            </h1>
            <p className="text-slate-500">
              We are finalizing your subscription. This usually takes a few
              seconds. Please do not refresh the page.
            </p>
          </div>
        )}

        {status === "confirmed" && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Payment Successful!
            </h1>
            <p className="text-slate-500">
              Your account has been upgraded. Redirecting you to your
              dashboard...
            </p>
            <Button onClick={() => router.push(`/${orgId}`)} className="mt-4">
              Go to Dashboard Now
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <XCircle className="w-16 h-16 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Validation Timeout
            </h1>
            <p className="text-slate-500">
              Your payment was likely successful, but we&apos;re having trouble
              confirming it right now. Please check your dashboard in a minute.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push(`/${orgId}/billing`)}
            >
              Back to Billing
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
