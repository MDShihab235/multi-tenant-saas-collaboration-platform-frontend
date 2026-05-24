"use client";

// ============================================================
//  ProjectRoleGate — Conditionally renders based on the user's
//  ProjectMemberRole (OWNER | MANAGER | CONTRIBUTOR | VIEWER).
//
//  Usage:
//    <ProjectRoleGate projectId={id} members={members} minRole="MANAGER">
//      <ManageSettingsButton />
//    </ProjectRoleGate>
// ============================================================

import type { ReactNode } from "react";
import { useProjectRBAC } from "@/hooks/useRBAC";
import type { ProjectMemberRole } from "@/lib/rbac/types";
import { PROJECT_ROLE_PERMISSIONS } from "@/lib/rbac/permissions";

interface ProjectRoleGateProps {
  projectId: string;
  members: Array<{ userId: string; role: ProjectMemberRole }>;
  /** Minimum required role in the hierarchy (OWNER > MANAGER > CONTRIBUTOR > VIEWER) */
  minRole?: ProjectMemberRole;
  /** Or check a specific permission key from the matrix */
  can?: keyof (typeof PROJECT_ROLE_PERMISSIONS)[ProjectMemberRole];
  fallback?: ReactNode;
  children: ReactNode;
}

export function ProjectRoleGate({
  projectId,
  members,
  minRole,
  can,
  fallback = null,
  children,
}: ProjectRoleGateProps) {
  const { hasMinRole, canProject } = useProjectRBAC(projectId, members);

  let allowed = false;

  if (minRole) {
    allowed = hasMinRole(minRole);
  } else if (can) {
    allowed = canProject(can);
  } else {
    // No constraint — just being a member is enough
    allowed = true;
  }

  return <>{allowed ? children : fallback}</>;
}
