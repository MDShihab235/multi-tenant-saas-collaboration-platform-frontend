"use client";

// ============================================================
//  PermissionGate — Conditionally renders children based on
//  org-level RBAC. Uses useRBAC under the hood.
//
//  Usage:
//    <PermissionGate permission="create:project">
//      <CreateProjectButton />
//    </PermissionGate>
//
//    <PermissionGate permission={["manage:member","delete:member"]} mode="any">
//      <RemoveMemberButton />
//    </PermissionGate>
//
//    <PermissionGate permission="delete:organization" fallback={<ReadonlyBanner />}>
//      <DangerZone />
//    </PermissionGate>
// ============================================================

import type { ReactNode } from "react";
import { useRBAC } from "@/hooks/useRBAC";
import type { PermissionString } from "@/lib/rbac/types";

interface PermissionGateProps {
  /** Single permission or array of permissions to check */
  permission: PermissionString | PermissionString[];
  /**
   * "any" = user needs at least ONE of the listed permissions (default)
   * "all" = user needs ALL of the listed permissions
   */
  mode?: "any" | "all";
  /** Rendered when the user does NOT have the permission */
  fallback?: ReactNode;
  children: ReactNode;
  /** Override orgId (uses active org by default) */
  orgId?: string;
}

export function PermissionGate({
  permission,
  mode = "any",
  fallback = null,
  children,
  orgId,
}: PermissionGateProps) {
  const { can, canAll, canAny, isLoading } = useRBAC(orgId);

  if (isLoading) return null;

  const perms = Array.isArray(permission) ? permission : [permission];
  const allowed = mode === "all" ? canAll(perms) : canAny(perms);

  return <>{allowed ? children : fallback}</>;
}

// ── Convenience variants ──────────────────────────────────────

/** Only renders for org owners */
export function OwnerGate({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isOwner, isLoading } = useRBAC();
  if (isLoading) return null;
  return <>{isOwner ? children : fallback}</>;
}

/** Only renders for platform admins */
export function AdminGate({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isAdmin, isLoading } = useRBAC();
  if (isLoading) return null;
  return <>{isAdmin ? children : fallback}</>;
}

/** Renders for org owners OR platform admins */
export function OrgAdminGate({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isOrgAdmin, isLoading } = useRBAC();
  if (isLoading) return null;
  return <>{isOrgAdmin ? children : fallback}</>;
}
