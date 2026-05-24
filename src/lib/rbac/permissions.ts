// ============================================================
//  Permission Constants & Default Role Templates
//
//  These are the canonical "action:resource" strings the system
//  understands. Admins can add custom permissions via the API,
//  but these are the built-in ones seeded at startup.
//
//  Source: schema.prisma Permission model
//    { action: string, resource: string }
//    @@unique([action, resource])
// ============================================================

import type { DefaultRoleTemplate, PermissionString } from "./types";

// ─────────────────────────────────────────────────────────────
// § 1 — ALL PERMISSIONS
// Grouped by resource for readability.
// ─────────────────────────────────────────────────────────────

export const PERMISSIONS = {
  // ── Organization ─────────────────────────────────────────
  organization: {
    read:   "read:organization"   as PermissionString,
    update: "update:organization" as PermissionString,
    delete: "delete:organization" as PermissionString,
    manage: "manage:organization" as PermissionString,
  },

  // ── Members ──────────────────────────────────────────────
  member: {
    read:   "read:member"   as PermissionString,
    create: "create:member" as PermissionString, // invite
    update: "update:member" as PermissionString, // change role
    delete: "delete:member" as PermissionString, // kick
    manage: "manage:member" as PermissionString,
  },

  // ── Invitations ──────────────────────────────────────────
  invitation: {
    read:   "read:invitation"   as PermissionString,
    create: "create:invitation" as PermissionString,
    delete: "delete:invitation" as PermissionString, // revoke
    manage: "manage:invitation" as PermissionString,
  },

  // ── Roles ────────────────────────────────────────────────
  role: {
    read:   "read:role"   as PermissionString,
    create: "create:role" as PermissionString,
    update: "update:role" as PermissionString,
    delete: "delete:role" as PermissionString,
    manage: "manage:role" as PermissionString,
  },

  // ── Permissions ──────────────────────────────────────────
  permission: {
    read:   "read:permission"   as PermissionString,
    create: "create:permission" as PermissionString,
    update: "update:permission" as PermissionString,
    delete: "delete:permission" as PermissionString,
    manage: "manage:permission" as PermissionString,
  },

  // ── Projects ─────────────────────────────────────────────
  project: {
    read:   "read:project"   as PermissionString,
    create: "create:project" as PermissionString,
    update: "update:project" as PermissionString,
    delete: "delete:project" as PermissionString,
    manage: "manage:project" as PermissionString,
  },

  // ── Tasks ────────────────────────────────────────────────
  task: {
    read:   "read:task"   as PermissionString,
    create: "create:task" as PermissionString,
    update: "update:task" as PermissionString,
    delete: "delete:task" as PermissionString,
    manage: "manage:task" as PermissionString,
  },

  // ── Comments ─────────────────────────────────────────────
  comment: {
    read:   "read:comment"   as PermissionString,
    create: "create:comment" as PermissionString,
    update: "update:comment" as PermissionString,
    delete: "delete:comment" as PermissionString,
  },

  // ── Attachments ──────────────────────────────────────────
  attachment: {
    read:   "read:attachment"   as PermissionString,
    create: "create:attachment" as PermissionString,
    delete: "delete:attachment" as PermissionString,
  },

  // ── Labels ───────────────────────────────────────────────
  label: {
    read:   "read:label"   as PermissionString,
    create: "create:label" as PermissionString,
    update: "update:label" as PermissionString,
    delete: "delete:label" as PermissionString,
  },

  // ── API Keys ─────────────────────────────────────────────
  api_key: {
    read:   "read:api_key"   as PermissionString,
    create: "create:api_key" as PermissionString,
    update: "update:api_key" as PermissionString,
    delete: "delete:api_key" as PermissionString,
    manage: "manage:api_key" as PermissionString,
  },

  // ── Billing ──────────────────────────────────────────────
  billing: {
    read:   "read:billing"   as PermissionString,
    update: "update:billing" as PermissionString,
    manage: "manage:billing" as PermissionString,
  },

  // ── Activity Log ─────────────────────────────────────────
  activity_log: {
    read:   "read:activity_log"   as PermissionString,
    delete: "delete:activity_log" as PermissionString, // purge
  },

  // ── Files ────────────────────────────────────────────────
  file: {
    read:   "read:file"   as PermissionString,
    create: "create:file" as PermissionString,
    delete: "delete:file" as PermissionString,
  },
} as const;

// ─────────────────────────────────────────────────────────────
// § 2 — FLAT LIST (for loops / dropdowns)
// ─────────────────────────────────────────────────────────────

export const ALL_PERMISSIONS: PermissionString[] = Object.values(PERMISSIONS).flatMap(
  (group) => Object.values(group) as PermissionString[],
);

// ─────────────────────────────────────────────────────────────
// § 3 — PERMISSION METADATA (for UI labels & grouping)
// ─────────────────────────────────────────────────────────────

export const PERMISSION_LABELS: Record<string, string> = {
  // organization
  "read:organization":   "View organization details",
  "update:organization": "Edit organization name & slug",
  "delete:organization": "Delete organization",
  "manage:organization": "Full organization control",
  // member
  "read:member":   "View members list",
  "create:member": "Invite new members",
  "update:member": "Change member roles",
  "delete:member": "Remove members",
  "manage:member": "Full member management",
  // invitation
  "read:invitation":   "View invitations",
  "create:invitation": "Send invitations",
  "delete:invitation": "Revoke invitations",
  "manage:invitation": "Full invitation control",
  // role
  "read:role":   "View roles",
  "create:role": "Create custom roles",
  "update:role": "Edit role names",
  "delete:role": "Delete roles",
  "manage:role": "Full role management",
  // permission
  "read:permission":   "View permissions",
  "create:permission": "Create permissions",
  "update:permission": "Edit permission labels",
  "delete:permission": "Delete permissions",
  "manage:permission": "Full permission control",
  // project
  "read:project":   "View projects",
  "create:project": "Create projects",
  "update:project": "Edit project details",
  "delete:project": "Delete projects",
  "manage:project": "Full project control",
  // task
  "read:task":   "View tasks",
  "create:task": "Create tasks",
  "update:task": "Edit tasks",
  "delete:task": "Delete tasks",
  "manage:task": "Full task control",
  // comment
  "read:comment":   "View comments",
  "create:comment": "Post comments",
  "update:comment": "Edit own comments",
  "delete:comment": "Delete comments",
  // attachment
  "read:attachment":   "View attachments",
  "create:attachment": "Upload attachments",
  "delete:attachment": "Delete attachments",
  // label
  "read:label":   "View labels",
  "create:label": "Create labels",
  "update:label": "Edit labels",
  "delete:label": "Delete labels",
  // api_key
  "read:api_key":   "View API keys",
  "create:api_key": "Generate API keys",
  "update:api_key": "Edit API key settings",
  "delete:api_key": "Revoke API keys",
  "manage:api_key": "Full API key control",
  // billing
  "read:billing":   "View billing & invoices",
  "update:billing": "Change billing plan / cycle",
  "manage:billing": "Full billing control",
  // activity_log
  "read:activity_log":   "View activity logs",
  "delete:activity_log": "Purge activity logs",
  // file
  "read:file":   "View files",
  "create:file": "Upload files",
  "delete:file": "Delete files",
};

export const RESOURCE_DISPLAY_NAMES: Record<string, string> = {
  organization: "Organization",
  member:       "Members",
  invitation:   "Invitations",
  role:         "Roles",
  permission:   "Permissions",
  project:      "Projects",
  task:         "Tasks",
  comment:      "Comments",
  attachment:   "Attachments",
  label:        "Labels",
  api_key:      "API Keys",
  billing:      "Billing",
  activity_log: "Activity Log",
  file:         "Files",
};

// ─────────────────────────────────────────────────────────────
// § 4 — DEFAULT ROLE TEMPLATES
// Used when creating a new org (seeding default roles) and
// shown in the "Create role" UI as quick-start presets.
// ─────────────────────────────────────────────────────────────

export const DEFAULT_ROLE_TEMPLATES: DefaultRoleTemplate[] = [
  {
    name: "Owner",
    description: "Full control over everything in the organization. Automatically assigned to the org creator.",
    color: "#f59e0b",
    permissions: ALL_PERMISSIONS,
  },
  {
    name: "Admin",
    description: "Can manage members, roles, projects, and billing. Cannot delete the organization.",
    color: "#6366f1",
    permissions: [
      // org (no delete)
      PERMISSIONS.organization.read,
      PERMISSIONS.organization.update,
      // members
      PERMISSIONS.member.read,
      PERMISSIONS.member.create,
      PERMISSIONS.member.update,
      PERMISSIONS.member.delete,
      // invitations
      PERMISSIONS.invitation.read,
      PERMISSIONS.invitation.create,
      PERMISSIONS.invitation.delete,
      // roles
      PERMISSIONS.role.read,
      PERMISSIONS.role.create,
      PERMISSIONS.role.update,
      PERMISSIONS.role.delete,
      // permissions
      PERMISSIONS.permission.read,
      // projects — full
      PERMISSIONS.project.read,
      PERMISSIONS.project.create,
      PERMISSIONS.project.update,
      PERMISSIONS.project.delete,
      // tasks — full
      PERMISSIONS.task.read,
      PERMISSIONS.task.create,
      PERMISSIONS.task.update,
      PERMISSIONS.task.delete,
      // comments
      PERMISSIONS.comment.read,
      PERMISSIONS.comment.create,
      PERMISSIONS.comment.update,
      PERMISSIONS.comment.delete,
      // attachments
      PERMISSIONS.attachment.read,
      PERMISSIONS.attachment.create,
      PERMISSIONS.attachment.delete,
      // labels
      PERMISSIONS.label.read,
      PERMISSIONS.label.create,
      PERMISSIONS.label.update,
      PERMISSIONS.label.delete,
      // api keys
      PERMISSIONS.api_key.read,
      PERMISSIONS.api_key.create,
      PERMISSIONS.api_key.update,
      PERMISSIONS.api_key.delete,
      // billing (read + update, no manage)
      PERMISSIONS.billing.read,
      PERMISSIONS.billing.update,
      // activity log
      PERMISSIONS.activity_log.read,
      // files
      PERMISSIONS.file.read,
      PERMISSIONS.file.create,
      PERMISSIONS.file.delete,
    ],
  },
  {
    name: "Manager",
    description: "Manages projects, tasks, and team members within projects. Cannot touch billing or org settings.",
    color: "#0891b2",
    permissions: [
      PERMISSIONS.organization.read,
      // members (read only)
      PERMISSIONS.member.read,
      // invitations
      PERMISSIONS.invitation.read,
      PERMISSIONS.invitation.create,
      // projects — full
      PERMISSIONS.project.read,
      PERMISSIONS.project.create,
      PERMISSIONS.project.update,
      // tasks — full
      PERMISSIONS.task.read,
      PERMISSIONS.task.create,
      PERMISSIONS.task.update,
      PERMISSIONS.task.delete,
      // comments
      PERMISSIONS.comment.read,
      PERMISSIONS.comment.create,
      PERMISSIONS.comment.update,
      PERMISSIONS.comment.delete,
      // attachments
      PERMISSIONS.attachment.read,
      PERMISSIONS.attachment.create,
      PERMISSIONS.attachment.delete,
      // labels — full
      PERMISSIONS.label.read,
      PERMISSIONS.label.create,
      PERMISSIONS.label.update,
      PERMISSIONS.label.delete,
      // activity log (read)
      PERMISSIONS.activity_log.read,
      // files
      PERMISSIONS.file.read,
      PERMISSIONS.file.create,
    ],
  },
  {
    name: "Developer",
    description: "Can create and manage tasks, use API keys, upload files. No admin or billing access.",
    color: "#16a34a",
    permissions: [
      PERMISSIONS.organization.read,
      PERMISSIONS.member.read,
      // projects
      PERMISSIONS.project.read,
      PERMISSIONS.project.create,
      PERMISSIONS.project.update,
      // tasks — full
      PERMISSIONS.task.read,
      PERMISSIONS.task.create,
      PERMISSIONS.task.update,
      PERMISSIONS.task.delete,
      // comments
      PERMISSIONS.comment.read,
      PERMISSIONS.comment.create,
      PERMISSIONS.comment.update,
      // attachments
      PERMISSIONS.attachment.read,
      PERMISSIONS.attachment.create,
      // labels
      PERMISSIONS.label.read,
      PERMISSIONS.label.create,
      // api keys (read + create)
      PERMISSIONS.api_key.read,
      PERMISSIONS.api_key.create,
      // activity log
      PERMISSIONS.activity_log.read,
      // files
      PERMISSIONS.file.read,
      PERMISSIONS.file.create,
    ],
  },
  {
    name: "Viewer",
    description: "Read-only access across the organization. Cannot create, edit, or delete anything.",
    color: "#71717a",
    permissions: [
      PERMISSIONS.organization.read,
      PERMISSIONS.member.read,
      PERMISSIONS.project.read,
      PERMISSIONS.task.read,
      PERMISSIONS.comment.read,
      PERMISSIONS.attachment.read,
      PERMISSIONS.label.read,
      PERMISSIONS.activity_log.read,
      PERMISSIONS.file.read,
    ],
  },
  {
    name: "Billing Admin",
    description: "Can view and manage billing, invoices, and subscription plans. No project access.",
    color: "#be185d",
    permissions: [
      PERMISSIONS.organization.read,
      PERMISSIONS.billing.read,
      PERMISSIONS.billing.update,
      PERMISSIONS.billing.manage,
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// § 5 — PROJECT MEMBER ROLE PERMISSIONS
// Fixed (not stored in DB). These are always the same.
// ─────────────────────────────────────────────────────────────

export const PROJECT_ROLE_PERMISSIONS: Record<
  "OWNER" | "MANAGER" | "CONTRIBUTOR" | "VIEWER",
  {
    canCreateTask: boolean;
    canUpdateTask: boolean;
    canDeleteTask: boolean;
    canUpdateTaskStatus: boolean;
    canAssignTask: boolean;
    canAddComment: boolean;
    canDeleteAnyComment: boolean;
    canUploadAttachment: boolean;
    canDeleteAnyAttachment: boolean;
    canManageLabels: boolean;
    canManageProjectSettings: boolean;
    canManageMembers: boolean;
    canDeleteProject: boolean;
  }
> = {
  OWNER: {
    canCreateTask: true,
    canUpdateTask: true,
    canDeleteTask: true,
    canUpdateTaskStatus: true,
    canAssignTask: true,
    canAddComment: true,
    canDeleteAnyComment: true,
    canUploadAttachment: true,
    canDeleteAnyAttachment: true,
    canManageLabels: true,
    canManageProjectSettings: true,
    canManageMembers: true,
    canDeleteProject: true,
  },
  MANAGER: {
    canCreateTask: true,
    canUpdateTask: true,
    canDeleteTask: true,
    canUpdateTaskStatus: true,
    canAssignTask: true,
    canAddComment: true,
    canDeleteAnyComment: true,
    canUploadAttachment: true,
    canDeleteAnyAttachment: true,
    canManageLabels: true,
    canManageProjectSettings: true,
    canManageMembers: true,
    canDeleteProject: false,
  },
  CONTRIBUTOR: {
    canCreateTask: true,
    canUpdateTask: true,
    canDeleteTask: false,
    canUpdateTaskStatus: true,
    canAssignTask: false,
    canAddComment: true,
    canDeleteAnyComment: false, // own only
    canUploadAttachment: true,
    canDeleteAnyAttachment: false, // own only
    canManageLabels: false,
    canManageProjectSettings: false,
    canManageMembers: false,
    canDeleteProject: false,
  },
  VIEWER: {
    canCreateTask: false,
    canUpdateTask: false,
    canDeleteTask: false,
    canUpdateTaskStatus: false,
    canAssignTask: false,
    canAddComment: false,
    canDeleteAnyComment: false,
    canUploadAttachment: false,
    canDeleteAnyAttachment: false,
    canManageLabels: false,
    canManageProjectSettings: false,
    canManageMembers: false,
    canDeleteProject: false,
  },
};

// ─────────────────────────────────────────────────────────────
// § 6 — HELPER: parse "action:resource" string
// ─────────────────────────────────────────────────────────────

export function parsePermission(perm: string): { action: string; resource: string } | null {
  const parts = perm.split(":");
  if (parts.length !== 2) return null;
  return { action: parts[0], resource: parts[1] };
}

/** Build a PermissionString from action + resource (from DB) */
export function buildPermissionString(action: string, resource: string): string {
  return `${action}:${resource}`;
}
