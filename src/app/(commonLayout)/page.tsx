import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  Shield,
  Zap,
} from "lucide-react";

export default function SaaSPlatformHome() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex justify-center text-center px-4">
        {/* Background glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-100 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="container max-w-5xl relative z-10 flex flex-col items-center gap-6">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary mb-4">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            CollabPro v2.0 is now live
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-balance">
            The ultimate workspace for <br className="hidden md:block" />
            <span className="bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              high-performing teams
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-balance mt-4">
            Unite your organization with powerful project management,
            enterprise-grade security, and dynamic role-based access control.
            All in one multi-tenant platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/register">
              <Button
                size="lg"
                className="w-full sm:w-auto font-semibold gap-2"
              >
                Start for free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto font-semibold"
              >
                Sign in to workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. FEATURES GRID */}
      <section className="py-20 bg-muted/30 px-4 flex justify-center">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything you need to scale
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built from the ground up for B2B SaaS, handling everything from
              isolated tenant data to automated Stripe billing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-background border-muted shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <LayoutDashboard className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Isolated Workspaces</CardTitle>
                <CardDescription>
                  True multi-tenancy. Keep your projects, tasks, and files
                  completely separate and secure for every organization.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-background border-muted shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <Shield className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Advanced RBAC</CardTitle>
                <CardDescription>
                  Granular role-based access control. Assign Owners, Admins, and
                  Members to ensure the right people have the right access.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-background border-muted shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <Zap className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Real-Time Collaboration</CardTitle>
                <CardDescription>
                  Kanban boards, instant notifications, and task comments to
                  keep your team moving at lightning speed.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. BOTTOM CTA */}
      <section className="py-24 px-4 flex justify-center">
        <div className="container max-w-4xl bg-primary text-primary-foreground rounded-3xl p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 relative z-10">
            Ready to transform your workflow?
          </h2>
          <p className="text-primary-foreground/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto relative z-10">
            Join hundreds of organizations already using our platform to manage
            their most critical projects.
          </p>

          <ul className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mb-10 text-sm font-medium relative z-10">
            <li className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> No credit card required
            </li>
            <li className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> 14-day free trial
            </li>
            <li className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Cancel anytime
            </li>
          </ul>

          <Link href="/register" className="relative z-10">
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto text-primary font-bold px-8 py-6 text-lg hover:bg-white transition-colors"
            >
              Create your Workspace
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
