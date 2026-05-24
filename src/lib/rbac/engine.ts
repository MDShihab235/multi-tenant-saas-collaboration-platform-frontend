// ============================================================
//  RBAC Engine — Pure functions, no React dependencies
//
//  Two independent RBAC layers:
//
//  Layer 1 — Org-level (dynamic, DB-backed)
//    User → Membership → Role → RolePermission → Permission
//    Evaluated via: checkOrgPermission()
//
//  Layer 2 — Project-level (static enum)
//    User → ProjectMember.role (OWNER|MANAGER|CONTRIBUTOR|VIEWER)
//    Evaluated via: checkProjectPermission()
//
//  Layer 0 — Platform (hardcoded)
//    Org owner  → always allowed in their org
//    isPlatformAdmin → always allowed everywhere
// ============================================================

import type {
  OrgRBACContext,
  ProjectRBACContext,
  PermissionCheckResult,
  PermissionString,
  ProjectMemberRole,
  Membership,
  Role,
  User,
} from "./types";
import { PROJECT_ROLE_PERMISSIONS, buildPermissionString } from "./permissions";

// ─────────────────────────────────────────────────────────────
// § 1 — BUILD ORG RBAC CONTEXT
// Called once after /auth/me response arrives.
// ─────────────────────────────────────────────────────────────

interface BuildContextArgs {
  user: User & {
    memberships?: Membership[];
  };
  orgId: string;
  orgOwnerId: string;
}

/**
 * Builds the OrgRBACContext for a specific org.
 *
 * The PERMISSIONS set is built by walking:
 *   user.memberships → find this org → role.rolePermissions → permissions
 */
export function buildOrgRBACContext({
  user,
  orgId,
  orgOwnerId,
}: BuildContextArgs): OrgRBACContext {
  const membership = user.memberships?.find((m) => m.organizationId === orgId);

  const role =
    (membership?.role as Role & {
      rolePermissions?: NonNullable<Role["rolePermissions"]>;
    }) ?? null;

  // Flatten role permissions into a Set<"action:resource">
  const permissions = new Set<PermissionString>();

  if (role?.rolePermissions) {
    for (const rp of role.rolePermissions) {
      if (rp.permission) {
        const str = buildPermissionString(
          rp.permission.action,
          rp.permission.resource,
        ) as PermissionString;
        permissions.add(str);
      }
    }
  }

  return {
    userId: user.id,
    orgId,
    isOrgOwner: orgOwnerId === user.id,
    isPlatformAdmin:
      (user as unknown as Record<string, unknown>).isAdmin === true,
    role,
    permissions,
  };
}

// ─────────────────────────────────────────────────────────────
// § 2 — BUILD PROJECT RBAC CONTEXT
// ─────────────────────────────────────────────────────────────

export function buildProjectRBACContext(
  userId: string,
  projectId: string,
  projectMembers: Array<{ userId: string; role: ProjectMemberRole }>,
): ProjectRBACContext {
  const member = projectMembers.find((m) => m.userId === userId);

  return {
    userId,
    projectId,
    projectRole: member?.role ?? null,
  };
}

// ─────────────────────────────────────────────────────────────
// § 3 — ORG PERMISSION CHECK
// ─────────────────────────────────────────────────────────────

/**
 * Checks whether a user has a specific permission in an org.
 *
 * Priority order:
 *   1. Platform admin     → always allowed
 *   2. Org owner          → always allowed
 *   3. Permission in Set  → allowed
 *   4. Otherwise          → denied
 */
export function checkOrgPermission(
  ctx: OrgRBACContext,
  required: PermissionString | PermissionString[],
): PermissionCheckResult {
  // Platform admin bypasses all checks
  if (ctx.isPlatformAdmin) {
    return {
      allowed: true,
      reason: "Platform admin — all permissions granted",
    };
  }

  // Org owner bypasses all checks within their org
  if (ctx.isOrgOwner) {
    return { allowed: true, reason: "Organization owner — full access" };
  }

  // Check the permission set
  const required_arr = Array.isArray(required) ? required : [required];

  for (const perm of required_arr) {
    if (ctx.permissions.has(perm)) {
      return { allowed: true, reason: `Role grants "${perm}"` };
    }

    // "manage:resource" also covers all other actions on that resource
    const resource = perm.split(":")[1];
    const manageKey = `manage:${resource}` as PermissionString;
    if (ctx.permissions.has(manageKey)) {
      return {
        allowed: true,
        reason: `Role grants "${manageKey}" (covers "${perm}")`,
      };
    }
  }

  return {
    allowed: false,
    reason: `Role "${ctx.role?.name ?? "none"}" does not grant: ${required_arr.join(" or ")}`,
  };
}

/**
 * Returns true if the user has ALL of the listed permissions.
 */
export function hasAllPermissions(
  ctx: OrgRBACContext,
  permissions: PermissionString[],
): boolean {
  return permissions.every((p) => checkOrgPermission(ctx, p).allowed);
}

/**
 * Returns true if the user has ANY of the listed permissions.
 */
export function hasAnyPermission(
  ctx: OrgRBACContext,
  permissions: PermissionString[],
): boolean {
  return permissions.some((p) => checkOrgPermission(ctx, p).allowed);
}

// ─────────────────────────────────────────────────────────────
// § 4 — PROJECT PERMISSION CHECK
// ─────────────────────────────────────────────────────────────

type ProjectPermissionKey =
  keyof (typeof PROJECT_ROLE_PERMISSIONS)[ProjectMemberRole];

/**
 * Checks a project-level permission from the fixed permission matrix.
 * OrgOwner / PlatformAdmin shortcuts can be passed via isOrgOwner.
 */
export function checkProjectPermission(
  ctx: ProjectRBACContext,
  key: ProjectPermissionKey,
  options: { isOrgOwner?: boolean; isPlatformAdmin?: boolean } = {},
): PermissionCheckResult {
  if (options.isPlatformAdmin) {
    return { allowed: true, reason: "Platform admin" };
  }

  if (options.isOrgOwner) {
    return { allowed: true, reason: "Organization owner" };
  }

  if (!ctx.projectRole) {
    return {
      allowed: false,
      reason: "User is not a member of this project",
    };
  }

  const matrix = PROJECT_ROLE_PERMISSIONS[ctx.projectRole];
  const allowed = matrix[key] === true;

  return {
    allowed,
    reason: allowed
      ? `Project role "${ctx.projectRole}" grants "${key}"`
      : `Project role "${ctx.projectRole}" does not grant "${key}"`,
  };
}

// ─────────────────────────────────────────────────────────────
// § 5 — PROJECT ROLE HIERARCHY HELPERS
// ─────────────────────────────────────────────────────────────

const PROJECT_ROLE_RANK: Record<ProjectMemberRole, number> = {
  OWNER: 4,
  MANAGER: 3,
  CONTRIBUTOR: 2,
  VIEWER: 1,
};

/** Returns true if userRole >= minimumRole in the hierarchy */
export function hasMinProjectRole(
  userRole: ProjectMemberRole | null,
  minimumRole: ProjectMemberRole,
): boolean {
  if (!userRole) return false;
  return PROJECT_ROLE_RANK[userRole] >= PROJECT_ROLE_RANK[minimumRole];
}

// ─────────────────────────────────────────────────────────────
// § 6 — ORG ROLE HIERARCHY HELPERS
// ─────────────────────────────────────────────────────────────

/** Returns true if a context is an org owner or platform admin */
export function isOrgAdmin(ctx: OrgRBACContext): boolean {
  return ctx.isOrgOwner || ctx.isPlatformAdmin;
}

/** Returns true if user can manage any aspect of org settings */
export function canManageOrg(ctx: OrgRBACContext): boolean {
  return checkOrgPermission(ctx, "manage:organization").allowed;
}

/** Returns true if user can invite / remove members */
export function canManageMembers(ctx: OrgRBACContext): boolean {
  return hasAnyPermission(ctx, [
    "manage:member",
    "create:member",
    "delete:member",
  ]);
}

/** Returns true if user can create projects in this org */
export function canCreateProject(ctx: OrgRBACContext): boolean {
  return checkOrgPermission(ctx, "create:project").allowed;
}

/** Returns true if user can manage roles (create/edit/delete) */
export function canManageRoles(ctx: OrgRBACContext): boolean {
  return hasAnyPermission(ctx, [
    "manage:role",
    "create:role",
    "update:role",
    "delete:role",
  ]);
}

/** Returns true if user can view billing information */
export function canViewBilling(ctx: OrgRBACContext): boolean {
  return checkOrgPermission(ctx, "read:billing").allowed;
}

/** Returns true if user can manage API keys */
export function canManageApiKeys(ctx: OrgRBACContext): boolean {
  return hasAnyPermission(ctx, ["manage:api_key", "create:api_key"]);
}

// ─────────────────────────────────────────────────────────────
// § 7 — VALIDATION HELPERS (for UI form guards)
// ─────────────────────────────────────────────────────────────

/** Returns first denied permission or null if all allowed */
export function getFirstDenied(
  ctx: OrgRBACContext,
  permissions: PermissionString[],
): PermissionString | null {
  for (const p of permissions) {
    if (!checkOrgPermission(ctx, p).allowed) return p;
  }
  return null;
}

/** For "owner-only" actions (delete org, change owner role) */
export function requiresOwner(ctx: OrgRBACContext): PermissionCheckResult {
  if (ctx.isOrgOwner || ctx.isPlatformAdmin) {
    return { allowed: true, reason: "Owner-only action — granted" };
  }
  return {
    allowed: false,
    reason: "Only the organization owner can perform this action",
  };
}
