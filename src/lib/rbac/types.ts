// ============================================================
//  RBAC Types
//  Derived from schema.prisma:
//    Role → RolePermission → Permission   (org-level, dynamic)
//    ProjectMemberRole enum               (project-level, fixed)
//    UserStatus                           (platform-level)
// ============================================================

// ── Enums mirrored from schema ────────────────────────────────

// export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED" | "DELETED";

// /** Fixed project-level roles (schema: ProjectMemberRole enum) */
// export type ProjectMemberRole = "OWNER" | "MANAGER" | "CONTRIBUTOR" | "VIEWER";

// ── Permission format: "action:resource" ─────────────────────

/**
 * Actions that can be performed on resources.
 * Maps to Permission.action in the database.
 */
export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "manage"; // "manage" = full CRUD + admin actions

/**
 * Resources that actions apply to.
 * Maps to Permission.resource in the database.
 */
export type PermissionResource =
  | "organization"
  | "member"
  | "invitation"
  | "role"
  | "permission"
  | "project"
  | "task"
  | "comment"
  | "attachment"
  | "label"
  | "api_key"
  | "billing"
  | "activity_log"
  | "file";

/** Canonical permission string: "action:resource" */
export type PermissionString = `${PermissionAction}:${PermissionResource}`;

// ── DB-shaped types (from API responses) ─────────────────────

/** Schema: Permission model */
export interface ApiPermission {
  id: string;
  action: string;
  resource: string;
}

/** Schema: RolePermission pivot */
export interface ApiRolePermission {
  roleId: string;
  permissionId: string;
  permission: Pick<ApiPermission, "id" | "action" | "resource">;
}

/** Schema: Role model with nested permissions */
export interface ApiRole {
  id: string;
  organizationId: string;
  name: string;
  rolePermissions?: ApiRolePermission[];
  _count?: { memberships: number };
}

/** Schema: Membership model carrying a Role */
export interface ApiMembership {
  id: string;
  userId: string;
  organizationId: string;
  roleId: string;
  joinedAt: string;
  role?: Pick<ApiRole, "id" | "name"> & {
    rolePermissions?: ApiRolePermission[];
  };
}

/** Schema: ProjectMember model */
export interface ApiProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  joinedAt: string;
}

// ── RBAC context objects ─────────────────────────────────────

/**
 * The full RBAC context for the current user inside one org.
 * Built by the useRBAC hook from /auth/me + org membership data.
 */
export interface OrgRBACContext {
  /** Current user's ID */
  userId: string;
  /** The org being accessed */
  orgId: string;
  /** True if this user is the org owner (ownerId === userId) */
  isOrgOwner: boolean;
  /** True if this user has the platform ADMIN flag */
  isPlatformAdmin: boolean;
  /** The DB Role assigned to this user in the org */
  role: Role | null;
  /** Flat set of "action:resource" strings this user holds in the org */
  permissions: Set<PermissionString>;
}

/**
 * Project-level context. Project roles are fixed (enum-based),
 * not connected to the Permission catalog.
 */
export interface ProjectRBACContext {
  userId: string;
  projectId: string;
  /** null = not a project member */
  projectRole: ProjectMemberRole | null;
}

// ── Check result ─────────────────────────────────────────────

export interface PermissionCheckResult {
  allowed: boolean;
  /** Human-readable reason (for debug / error display) */
  reason: string;
}

// ── Default role template (for seeding / UI suggestions) ────

export interface DefaultRoleTemplate {
  name: string;
  description: string;
  permissions: PermissionString[];
  color: string;
}

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
  CANCELED = "CANCELED",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
  DELETED = "DELETED",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum ProjectMemberRole {
  OWNER = "OWNER",
  MANAGER = "MANAGER",
  CONTRIBUTOR = "CONTRIBUTOR",
  VIEWER = "VIEWER",
}

export enum NotificationType {
  TASK_ASSIGNED = "TASK_ASSIGNED",
  TASK_UPDATED = "TASK_UPDATED",
  COMMENT_ADDED = "COMMENT_ADDED",
  MEMBER_JOINED = "MEMBER_JOINED",
  MEMBER_REMOVED = "MEMBER_REMOVED",
  INVITATION_SENT = "INVITATION_SENT",
  SUBSCRIPTION_CHANGED = "SUBSCRIPTION_CHANGED",
  INVOICE_PAID = "INVOICE_PAID",
  GENERAL = "GENERAL",
}

export enum SubscriptionStatus {
  TRIALING = "TRIALING",
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  CANCELED = "CANCELED",
  PAUSED = "PAUSED",
  INCOMPLETE = "INCOMPLETE",
}

export enum BillingCycle {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export enum InvoiceStatus {
  DRAFT = "DRAFT",
  OPEN = "OPEN",
  PAID = "PAID",
  VOID = "VOID",
  UNCOLLECTIBLE = "UNCOLLECTIBLE",
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
  status: UserStatus;
  needPasswordChange: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  sessions?: Session[];
  accounts?: Account[];
  ownedOrganizations?: Organization[];
  memberships?: Membership[];
  projectMembers?: ProjectMember[];
  assignedTasks?: Task[];
  taskComments?: TaskComment[];
  taskAttachments?: TaskAttachment[];
  notifications?: Notification[];
  activityLogs?: ActivityLog[];
  files?: File[];
}

export interface Session {
  id: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  userId: string;

  // Relations
  user?: User;
}

export interface Account {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  accessTokenExpiresAt?: Date | null;
  refreshTokenExpiresAt?: Date | null;
  scope?: string | null;
  password?: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
}

export interface Verification {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  createdAt: Date;

  // Relations
  owner?: User;
  roles?: Role[];
  memberships?: Membership[];
  invitations?: Invitation[];
  projects?: Project[];
  activityLogs?: ActivityLog[];
  apiKeys?: ApiKey[];
  subscription?: Subscription | null;
}

export interface Role {
  id: string;
  organizationId: string;
  name: string;

  // Relations
  organization?: Organization;
  rolePermissions?: RolePermission[];
  memberships?: Membership[];
  invitations?: Invitation[];
}

export interface Permission {
  id: string;
  action: string;
  resource: string;

  // Relations
  rolePermissions?: RolePermission[];
}

export interface RolePermission {
  roleId: string;
  permissionId: string;

  // Relations
  role?: Role;
  permission?: Permission;
}

export interface Membership {
  id: string;
  userId: string;
  organizationId: string;
  roleId: string;
  joinedAt: string;

  // Relations
  user?: User;
  organization?: Organization;
  role?: Role;
}

export interface Invitation {
  id: string;
  organizationId: string;
  roleId: string;
  email: string;
  token: string;
  acceptedAt?: Date | null;
  expiresAt?: Date | null;
  createdAt: Date;

  // Relations
  organization?: Organization;
  role?: Role;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  organization?: Organization;
  projectMembers?: ProjectMember[];
  tasks?: Task[];
  labels?: Label[];
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  joinedAt: string;

  // Relations
  project?: Project;
  user?: User;
}

export interface Task {
  id: string;
  projectId: string;
  assignedTo?: string | null;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  project?: Project;
  assignee?: User | null;
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  taskLabels?: TaskLabel[];
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  task?: Task;
  user?: User;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  uploadedBy: string;
  fileUrl: string;
  createdAt: Date;

  // Relations
  task?: Task;
  uploader?: User;
}

export interface Label {
  id: string;
  projectId: string;
  name: string;
  color: string;

  // Relations
  project?: Project;
  taskLabels?: TaskLabel[];
}

export interface TaskLabel {
  taskId: string;
  labelId: string;

  // Relations
  task?: Task;
  label?: Label;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  isRead: boolean;
  createdAt: Date;

  // Relations
  user?: User;
}

export interface ActivityLog {
  id: string;
  organizationId: string;
  actorId: string;
  action: string;
  metadata?: Record<string, string | number | boolean | object | null> | null; // Mapping JSON field to dynamic object structure
  createdAt: Date;

  // Relations
  organization?: Organization;
  actor?: User;
}

export interface File {
  id: string;
  uploadedBy: string;
  url: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  createdAt: Date;

  // Relations
  uploader?: User;
}

export interface ApiKey {
  id: string;
  organizationId: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt?: Date | null;
  expiresAt?: Date | null;
  createdAt: Date;

  // Relations
  organization?: Organization;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  priceMonthly: number; // Alternatively can be assigned as string or Decimal object
  priceYearly: number; // depending on decimal library configuration
  currency: string;
  trialDays: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  subscriptions?: Subscription[];
  features?: PlanFeature[];
}

export interface Subscription {
  id: string;
  organizationId: string;
  planId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEndsAt?: Date | null;
  canceledAt?: Date | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  organization?: Organization;
  plan?: Plan;
  invoices?: Invoice[];
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  status: InvoiceStatus;
  amountDue: number;
  amountPaid: number;
  currency: string;
  periodStart: Date;
  periodEnd: Date;
  dueDate?: Date | null;
  paidAt?: Date | null;
  stripeInvoiceId?: string | null;
  invoicePdfUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  subscription?: Subscription;
}

export interface PlanFeature {
  id: string;
  planId: string;
  name: string;
  description?: string | null;
  limitValue?: number | null;
  isEnabled: boolean;
  createdAt: Date;

  // Relations
  plan?: Plan;
}
