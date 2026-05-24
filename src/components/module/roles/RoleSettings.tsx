"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Import remains the same to satisfy your current usage
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import {
  ShieldCheck,
  Plus,
  Users,
  ChevronRight,
  Trash2,
  Loader2,
  Lock,
  Crown,
  X,
  Copy,
} from "lucide-react";
import { useRBAC } from "@/hooks/useRBAC";
import { PermissionGate } from "@/components/rbac/PermissionGate";
import { DEFAULT_ROLE_TEMPLATES } from "@/lib/rbac/permissions";
import { organizationService } from "@/services/organization.service";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

type CreateRoleFormData = {
  name: string;
};

type Role = {
  id: string;
  name: string;
  rolePermissions?: unknown[];
  _count?: { memberships: number };
};

// 1. Rename the helper to start with "use" to satisfy the React Linter
const useTypeHelper = () =>
  useForm({
    defaultValues: { name: "" } as CreateRoleFormData,
  });

// 2. Extract the return type.
// This still bypasses the 12-argument requirement.
type CreateRoleFormApi = ReturnType<typeof useTypeHelper>;

export default function RolesPage({ params }: PageProps) {
  const { orgSlug } = use(params);
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Resolve orgId from slug
  const { data: orgs } = useQuery({
    queryKey: ["organizations", "my"],
    queryFn: () => organizationService.getMyOrganizations(),
  });
  const org = orgs?.find((o) => o.slug === orgSlug);
  const orgId = org?.id ?? "";

  const { can, isOwner, isAdmin, roleName } = useRBAC(orgId);

  // Fetch roles
  const { data: roles = [], isLoading } = useQuery<Role[]>({
    queryKey: ["roles", orgId],
    queryFn: () => organizationService.getOrganizationRoles(orgId),
    enabled: !!orgId,
  });

  // Create role
  const createForm = useForm({
    defaultValues: { name: "" } as CreateRoleFormData, // Cast the data here instead
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync(value.name);
    },
  });

  const createMutation = useMutation({
    mutationFn: (name: string) =>
      organizationService.createCustomRole(orgId, { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles", orgId] });
      setShowCreate(false);
      createForm.reset();
      setSelectedTemplate(null);
      toast.success("Role created successfully");
    },
    // Fixed: err should be handled safely
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "An error occurred";
      toast.error(message);
    },
  });

  // Delete role
  const deleteMutation = useMutation({
    mutationFn: (roleId: string) =>
      organizationService.deleteRole(orgId, roleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles", orgId] });
      setDeleteTarget(null);
      toast.success("Role deleted");
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "An error occurred";
      toast.error(message);
    },
  });

  const canCreate = can("create:role") || isOwner || isAdmin;
  const canDelete = can("delete:role") || isOwner || isAdmin;

  // ── Template picker ────────────────────────────────────────
  const handleUseTemplate = (templateName: string) => {
    setSelectedTemplate(templateName);
    createForm.setFieldValue("name", templateName);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 page-enter">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">
              Roles & Permissions
            </h1>
          </div>
          <p className="text-zinc-400 text-sm">
            Define who can do what inside{" "}
            <span className="text-zinc-200 font-medium">{org?.name} </span>.
            Each member is assigned one role.
          </p>
        </div>

        <PermissionGate permission="create:role" orgId={orgId}>
          <button
            onClick={() => setShowCreate(true)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold",
              "bg-amber-500 hover:bg-amber-400 text-zinc-950",
              "transition-all shadow-lg shadow-amber-500/20",
            )}
          >
            <Plus className="w-4 h-4" />
            New role
          </button>
        </PermissionGate>
      </div>

      {/* ── Info banner for non-admins ── */}
      {!canCreate && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700">
          <Lock className="w-4 h-4 text-zinc-500 shrink-0" />
          <p className="text-sm text-zinc-400">
            You have the{" "}
            <span className="text-zinc-200 font-medium">{roleName}</span> role.
            You can view roles but cannot create or delete them.
          </p>
        </div>
      )}

      {/* ── Role list ── */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-zinc-800 animate-pulse"
            />
          ))
        ) : roles.length === 0 ? (
          <EmptyRoles
            canCreate={canCreate}
            onCreate={() => setShowCreate(true)}
          />
        ) : (
          roles.map((role) => (
            <RoleRow
              key={role.id}
              role={role}
              orgSlug={orgSlug}
              isOwnerRole={role.name === "Owner"}
              canDelete={canDelete}
              onDelete={() => setDeleteTarget(role.id)}
            />
          ))
        )}
      </div>

      {/* ── Default templates section ── */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Role templates
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DEFAULT_ROLE_TEMPLATES.map((tpl) => (
            <TemplateCard
              key={tpl.name}
              template={tpl}
              onUse={
                canCreate
                  ? () => {
                      handleUseTemplate(tpl.name);
                      setShowCreate(true);
                    }
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      {/* ── Create modal ── */}
      {showCreate && (
        <CreateRoleModal
          form={createForm}
          isLoading={createMutation.isPending}
          selectedTemplate={selectedTemplate}
          onClose={() => {
            setShowCreate(false);
            createForm.reset();
            setSelectedTemplate(null);
          }}
        />
      )}

      {/* ── Delete confirm modal ── */}
      {deleteTarget && (
        <DeleteRoleModal
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Role Row
// ─────────────────────────────────────────────────────────────

function RoleRow({
  role,
  orgSlug,
  isOwnerRole,
  canDelete,
  onDelete,
}: {
  role: {
    id: string;
    name: string;
    rolePermissions?: unknown[];
    _count?: { memberships: number };
  };
  orgSlug: string;
  isOwnerRole: boolean;
  canDelete: boolean;
  onDelete: () => void;
}) {
  const permCount = role.rolePermissions?.length ?? 0;
  const memberCount = role._count?.memberships ?? 0;

  return (
    <div className="group flex items-center gap-4 px-5 py-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all">
      <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
        {isOwnerRole ? (
          <Crown className="w-4 h-4 text-amber-400" />
        ) : (
          <ShieldCheck className="w-4 h-4 text-zinc-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-zinc-100">{role.name}</p>
          {isOwnerRole && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              System
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            {permCount} permission{permCount !== 1 ? "s" : ""}
          </span>
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <Users className="w-3 h-3" />
            {memberCount} member{memberCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/${orgSlug}/settings/roles/${role.id}`}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
            "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700",
            "transition-all",
          )}
        >
          Manage
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        {canDelete && !isOwnerRole && (
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Delete role"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Template Card
// ─────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onUse,
}: {
  template: (typeof DEFAULT_ROLE_TEMPLATES)[number];
  onUse?: () => void;
}) {
  return (
    <div
      className={cn(
        "p-4 rounded-xl border bg-zinc-900/40 transition-all",
        onUse
          ? "hover:border-zinc-600 cursor-pointer border-zinc-800"
          : "border-zinc-800 opacity-60",
      )}
      onClick={onUse}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ background: template.color }}
        />
        <p className="text-sm font-semibold text-zinc-200">{template.name}</p>
      </div>
      <p className="text-xs text-zinc-500 leading-relaxed mb-3">
        {template.description}
      </p>
      <p className="text-xs text-zinc-600">
        {template.permissions.length} permissions
      </p>
      {onUse && (
        <div className="flex items-center gap-1 mt-2 text-xs text-amber-400">
          <Copy className="w-3 h-3" />
          Use template
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Create Role Modal
// ─────────────────────────────────────────────────────────────

function CreateRoleModal({
  form,
  isLoading,
  selectedTemplate,
  onClose,
}: {
  // 3. FIX: Using the inferred type here solves the 12-argument error
  form: CreateRoleFormApi;
  isLoading: boolean;
  selectedTemplate: string | null;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-zinc-50">Create new role</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {selectedTemplate && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <p className="text-xs text-amber-400">
              Using template:{" "}
              <span className="font-semibold">{selectedTemplate}</span>
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Permissions will be pre-populated from this template.
            </p>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                const str = String(value || "").trim();
                if (!str) return "Role name is required";
                if (str.length < 2) return "Must be at least 2 characters";
                if (str.length > 50) return "Must not exceed 50 characters";
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300">
                  Role name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Developer, Reviewer, Support…"
                  value={String(field.state.value)}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  autoFocus
                  className={cn(
                    "w-full px-3.5 py-2.5 rounded-xl text-sm",
                    "bg-zinc-800 border text-zinc-50 placeholder:text-zinc-600 outline-none transition-all",
                    field.state.meta.isTouched && field.state.meta.errors.length
                      ? "border-red-500/60 focus:ring-2 focus:ring-red-500/20"
                      : "border-zinc-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20",
                  )}
                />
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-400">
                      {String(field.state.meta.errors[0])}
                    </p>
                  )}
              </div>
            )}
          </form.Field>

          <p className="text-xs text-zinc-500">
            After creating the role, you can assign specific permissions on the
            role detail page.
          </p>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold",
                "bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all shadow-lg shadow-amber-500/20",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              )}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create role"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Delete Confirm Modal
// ─────────────────────────────────────────────────────────────

function DeleteRoleModal({
  isLoading,
  onConfirm,
  onClose,
}: {
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6 text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-zinc-50 mb-2">Delete role?</h2>
        <p className="text-sm text-zinc-400 mb-5">
          This role will be removed. You cannot delete a role that still has
          members assigned. Reassign members first.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-400 text-white transition-all disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────

function EmptyRoles({
  canCreate,
  onCreate,
}: {
  canCreate: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-4">
        <ShieldCheck className="w-7 h-7 text-zinc-600" />
      </div>
      <h3 className="text-zinc-300 font-semibold mb-1">No custom roles yet</h3>
      <p className="text-zinc-500 text-sm max-w-xs">
        Create roles to control what each team member can see and do in your
        organization.
      </p>
      {canCreate && (
        <button
          onClick={onCreate}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create first role
        </button>
      )}
    </div>
  );
}
