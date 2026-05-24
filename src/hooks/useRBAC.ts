"use client";

// ============================================================
//  useRBAC — Main RBAC hook
//
//  Provides the full org RBAC context for the current user
//  and exposes convenient helper functions for components.
//
//  Usage:
//    const { can, isOwner, isAdmin } = useRBAC(orgId);
//    const { canProject } = useProjectRBAC(projectId);
// ============================================================

import { useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useOrgStore } from "@/store/useOrgStore";
import {
  buildOrgRBACContext,
  buildProjectRBACContext,
  checkOrgPermission,
  checkProjectPermission,
  hasAllPermissions,
  hasAnyPermission,
  hasMinProjectRole,
  isOrgAdmin,
  canManageMembers,
  canManageRoles,
  canViewBilling,
  canCreateProject,
  requiresOwner,
} from "@/lib/rbac/engine";
import type {
  OrgRBACContext,
  PermissionString,
  ProjectMemberRole,
  ProjectRBACContext,
  Membership,
  User,
} from "@/lib/rbac/types";

// ─────────────────────────────────────────────────────────────
// § 1 — useRBAC (org-level)
// ─────────────────────────────────────────────────────────────

interface UseRBACReturn {
  /** Raw context object (useful for passing to pure engine functions) */
  ctx: OrgRBACContext | null;

  /** True while user data is loading */
  isLoading: boolean;

  /** True if the current user is the org owner */
  isOwner: boolean;

  /** True if the current user is a platform admin */
  isAdmin: boolean;

  /** True if the user has at least one membership in the org */
  isMember: boolean;

  /** The user's role name in this org (null if not a member) */
  roleName: string | null;

  /**
   * Check if the user has a specific permission.
   * Shortcuts: owner → true, admin → true, no membership → false.
   */
  can: (permission: PermissionString | PermissionString[]) => boolean;

  /** Check if user has ALL listed permissions */
  canAll: (permissions: PermissionString[]) => boolean;

  /** Check if user has ANY of the listed permissions */
  canAny: (permissions: PermissionString[]) => boolean;

  /** Convenience: can manage org-level member operations */
  canManageMembers: boolean;

  /** Convenience: can manage roles & permissions */
  canManageRoles: boolean;

  /** Convenience: can view billing page */
  canViewBilling: boolean;

  /** Convenience: can create projects */
  canCreateProject: boolean;

  /** Convenience: is org owner or platform admin */
  isOrgAdmin: boolean;

  /** True if this action requires org ownership (delete org etc.) */
  requiresOwner: boolean;
}

/**
 * Returns the org-level RBAC context for the given orgId.
 * If orgId is omitted, uses the active org from useOrgStore.
 */
export function useRBAC(orgId?: string): UseRBACReturn {
  const { user } = useAuthStore();
  const isLoading = false;
  const orgStore = useOrgStore();
  const { activeOrgId } = orgStore;
  const activeOrg = (orgStore as { activeOrg?: { ownerId: string } }).activeOrg;

  const resolvedOrgId = orgId ?? activeOrgId ?? "";
  const resolvedOrgOwnerId = activeOrg?.ownerId ?? "";

  const ctx = useMemo<OrgRBACContext | null>(() => {
    if (!user || !resolvedOrgId) return null;
    return buildOrgRBACContext({
      user: user as unknown as User & { memberships?: Membership[] },
      orgId: resolvedOrgId,
      orgOwnerId: resolvedOrgOwnerId,
    });
  }, [user, resolvedOrgId, resolvedOrgOwnerId]);

  return useMemo<UseRBACReturn>(() => {
    if (!ctx) {
      const noop = () => false;
      return {
        ctx: null,
        isLoading,
        isOwner: false,
        isAdmin: false,
        isMember: false,
        roleName: null,
        can: noop,
        canAll: noop,
        canAny: noop,
        canManageMembers: false,
        canManageRoles: false,
        canViewBilling: false,
        canCreateProject: false,
        isOrgAdmin: false,
        requiresOwner: false,
      };
    }

    return {
      ctx,
      isLoading,
      isOwner: ctx.isOrgOwner,
      isAdmin: ctx.isPlatformAdmin,
      isMember: ctx.role !== null || ctx.isOrgOwner,
      roleName: ctx.role?.name ?? (ctx.isOrgOwner ? "Owner" : null),
      can: (perm) => checkOrgPermission(ctx, perm).allowed,
      canAll: (perms) => hasAllPermissions(ctx, perms),
      canAny: (perms) => hasAnyPermission(ctx, perms),
      canManageMembers: canManageMembers(ctx),
      canManageRoles: canManageRoles(ctx),
      canViewBilling: canViewBilling(ctx),
      canCreateProject: canCreateProject(ctx),
      isOrgAdmin: isOrgAdmin(ctx),
      requiresOwner: requiresOwner(ctx).allowed,
    };
  }, [ctx, isLoading]);
}

// ─────────────────────────────────────────────────────────────
// § 2 — useProjectRBAC (project-level)
// ─────────────────────────────────────────────────────────────

interface UseProjectRBACReturn {
  ctx: ProjectRBACContext | null;
  projectRole: ProjectMemberRole | null;
  isProjectMember: boolean;
  isProjectOwner: boolean;
  isProjectManager: boolean;

  /** Check a project-level permission from the fixed matrix */
  canProject: (
    key:
      | "canCreateTask"
      | "canUpdateTask"
      | "canDeleteTask"
      | "canUpdateTaskStatus"
      | "canAssignTask"
      | "canAddComment"
      | "canDeleteAnyComment"
      | "canUploadAttachment"
      | "canDeleteAnyAttachment"
      | "canManageLabels"
      | "canManageProjectSettings"
      | "canManageMembers"
      | "canDeleteProject",
  ) => boolean;

  /** True if userRole >= required in hierarchy */
  hasMinRole: (min: ProjectMemberRole) => boolean;
}

export function useProjectRBAC(
  projectId: string,
  projectMembers: Array<{ userId: string; role: ProjectMemberRole }> = [],
): UseProjectRBACReturn {
  const { user } = useAuthStore();
  const orgStore = useOrgStore();
  const activeOrg = (orgStore as { activeOrg?: { ownerId: string } }).activeOrg;

  const ctx = useMemo<ProjectRBACContext | null>(() => {
    if (!user || !projectId) return null;
    return buildProjectRBACContext(user.id, projectId, projectMembers);
  }, [user, projectId, projectMembers]);

  const isOrgOwnerOrAdmin =
    activeOrg?.ownerId === user?.id ||
    (user as unknown as Record<string, unknown>)?.isAdmin === true;

  return useMemo<UseProjectRBACReturn>(() => {
    if (!ctx) {
      return {
        ctx: null,
        projectRole: null,
        isProjectMember: false,
        isProjectOwner: false,
        isProjectManager: false,
        canProject: () => false,
        hasMinRole: () => false,
      };
    }

    return {
      ctx,
      projectRole: ctx.projectRole,
      isProjectMember: ctx.projectRole !== null || isOrgOwnerOrAdmin,
      isProjectOwner: ctx.projectRole === "OWNER" || isOrgOwnerOrAdmin,
      isProjectManager:
        ctx.projectRole === "OWNER" ||
        ctx.projectRole === "MANAGER" ||
        isOrgOwnerOrAdmin,
      canProject: (key) =>
        checkProjectPermission(ctx, key, {
          isOrgOwner: activeOrg?.ownerId === user?.id,
          isPlatformAdmin:
            (user as unknown as Record<string, unknown>)?.isAdmin === true,
        }).allowed,
      hasMinRole: (min) => {
        if (isOrgOwnerOrAdmin) return true;
        return hasMinProjectRole(ctx.projectRole, min);
      },
    };
  }, [ctx, isOrgOwnerOrAdmin, activeOrg, user]);
}

// ─────────────────────────────────────────────────────────────
// § 3 — usePlatformAdmin
// ─────────────────────────────────────────────────────────────

/** Returns true if the current user is a platform admin */
export function usePlatformAdmin(): boolean {
  const { user } = useAuthStore();
  return (user as unknown as Record<string, unknown>)?.isAdmin === true;
}
