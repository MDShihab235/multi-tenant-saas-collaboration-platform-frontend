"use client"; // Required for useEffect and useState

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const [status, setStatus] = useState("processing");
  const searchParams = useSearchParams();
  const router = useRouter();

  // Usually, you'd pass a session_id or order_id in the URL from Stripe
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) return;

    // 1. Set up polling to check your OWN backend API
    const checkStatus = setInterval(async () => {
      try {
        // Replace this URL with your actual backend endpoint that checks DB status
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/invoices/status/${sessionId}`,
        );
        const data = await res.json();

        if (data.status === "PAID") {
          setStatus("confirmed");
          clearInterval(checkStatus);

          // Optional: Redirect to dashboard after 3 seconds
          setTimeout(() => router.push("/dashboard"), 3000);
        }
      } catch (error) {
        console.error("Error polling payment status:", error);
      }
    }, 2000); // Check every 2 seconds

    // 2. Cleanup: Stop polling if user leaves the page
    return () => clearInterval(checkStatus);
  }, [sessionId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="p-8 bg-white shadow-lg rounded-lg text-center">
        {status === "processing" ? (
          <>
            <h1 className="text-2xl font-bold mb-4">Verifying Payment...</h1>
            <p className="text-gray-600">
              Please don&apos;t close this window while we finalize your
              subscription.
            </p>
            {/* Add a spinner icon here */}
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-green-600 mb-4">
              Payment Successful!
            </h1>
            <p className="text-gray-600">
              Thank you! Redirecting you to your dashboard...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
