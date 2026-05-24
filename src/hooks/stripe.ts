// import { headers } from "next/headers";
// import { NextResponse } from "next/server";
// import Stripe from "stripe";
// import { subscriptionService } from "@/services/subscription.service";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2026-03-25.dahlia",
// });

// const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// export async function POST(req: Request) {
//   const body = await req.text(); // Accessing the raw request body
//   const signature = (await headers()).get("stripe-signature") as string;

//   let event: Stripe.Event;

//   // --- 1. CRYPTOGRAPHIC VERIFICATION ---
//   try {
//     event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
//   } catch (err: any) {
//     console.error(`[Webhook Signature Error]: ${err.message}`);
//     return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
//   }

//   // --- 2. ASYNCHRONOUS EVENT DISPATCHER ---
//   const data = event.data.object as any;

//   try {
//     switch (event.type) {
//       case "invoice.paid":
//         // Logic: Mark invoice as PAID and extend resource access
//         await subscriptionService.handleInvoicePaid(
//           data.customer as string,
//           data,
//         );
//         break;

//       case "invoice.payment_failed":
//         // Logic: Notify the user and potentially restrict access
//         await subscriptionService.handlePaymentFailed(data.customer as string);
//         break;

//       case "customer.subscription.deleted":
//         // Logic: Subscription ended. Downgrade Org to 'FREE' tier
//         await subscriptionService.handleSubscriptionDeleted(data.id);
//         break;

//       case "customer.subscription.updated":
//         // Logic: Handle plan changes or seat count updates
//         await subscriptionService.syncSubscription(data);
//         break;

//       default:
//         console.log(`[Stripe Webhook]: Unhandled event type ${event.type}`);
//     }
//   } catch (err: any) {
//     console.error(`[Webhook Processing Error]: ${err.message}`);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   }

//   return NextResponse.json({ received: true }, { status: 200 });
// }

// // Ensure this route is handled by the Node.js runtime for Stripe SDK compatibility
// export const runtime = "nodejs";
