// import { env } from "@/env";
// import { createAuthClient } from "better-auth/react";

// const NEXT_PUBLIC_AUTH_URL = env.NEXT_PUBLIC_AUTH_URL;
// export const authClient = createAuthClient({
//   /** The base URL of the server (optional if you're using the same domain) */
//   baseURL: `${NEXT_PUBLIC_AUTH_URL!}`,
//   fetchOptions: {
//     credentials: "include",
//   },
// });

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  fetchOptions: {
    credentials: "include",
  },
});

// export const authClient = createAuthClient({
//   baseURL: process.env.NEXT_PUBLIC_AUTH_URL!,
//   fetchOptions: {
//     credentials: "include",
//   },
// });
