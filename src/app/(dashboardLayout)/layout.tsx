import Sidebar from "@/components/module/dashboard/Sidebar";
import DashboardHeader from "@/components/module/dashboard/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 border-r bg-card/30 backdrop-blur-xl">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

// ("use client");

// import { useEffect } from "react";
// import { useAuth } from "@/hooks/use-auth";
// import { useRouter } from "next/navigation";
// import { Loader2 } from "lucide-react";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { user, fetchAuthMe, isLoading, isAuthenticated } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     // Run the "Heavy" fetch on mount for any dashboard route
//     fetchAuthMe();
//   }, [fetchAuthMe]);

//   // Handle Redirection logic
//   useEffect(() => {
//     if (!isLoading && !isAuthenticated) {
//       router.push("/login");
//     }

//     if (user?.needPasswordChange) {
//       router.push("/auth/reset-password?force=true");
//     }
//   }, [isLoading, isAuthenticated, user, router]);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-background">
//         <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
//         <p className="text-sm font-medium text-muted-foreground animate-pulse">
//           Restoring your workspace...
//         </p>
//       </div>
//     );
//   }

//   // Once loaded, render the sidebar and children
//   return (
//     <div className="flex min-h-screen">
//       {/* Sidebar would go here, consuming user.memberships for the OrgSwitcher */}
//       <aside className="w-64 border-r hidden md:block">
//         {/* <Sidebar memberships={user?.memberships} /> */}
//       </aside>

//       <main className="flex-1 overflow-y-auto">{children}</main>
//     </div>
//   );
// }
