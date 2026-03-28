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
