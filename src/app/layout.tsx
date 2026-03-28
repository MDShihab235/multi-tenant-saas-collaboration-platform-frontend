import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import QueryProviders from "@/provider/QueryProviders";
import { ThemeProvider } from "@/provider/ThemeProvider"; // Ensure you create this
import { Toaster } from "@/components/ui/sonner";

// Modern, friendly, and professional font for SaaS
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

// Crisp mono font for IDs, code, and technical data
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Multi-tenant SaaS Platform",
    template: "%s | Collab Pro",
  },
  description:
    "Next-generation collaboration platform for high-performing teams.",
  icons: {
    icon: "/favicon.ico", // Ensure you have a favicon
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProviders>{children}</QueryProviders>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
