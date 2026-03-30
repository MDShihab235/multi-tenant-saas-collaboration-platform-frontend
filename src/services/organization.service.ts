import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
});

export interface CreateOrgPayload {
  name: string;
  slug: string; // URL-friendly version of the name
}

export interface MyOrganization {
  id: string;
  name: string;
  slug: string;
  _count: {
    members: number;
    projects: number;
  };
  memberships: {
    role: string;
  }[];
  subscription?: {
    plan: {
      name: string;
    };
    status: string;
  };
}

export interface OrganizationDetail extends MyOrganization {
  owner: {
    id: string;
    name: string;
    email: string;
  };
  roles: {
    id: string;
    name: string;
    permissions: string[];
  }[];
}
export interface OrganizationStats {
  members: number;
  projects: number;
  tasks: number;
  activeApiKeys: number;
  subscription: {
    planName: string;
    status: string;
    expiryDate?: string;
  };
}

export interface OrganizationRole {
  organizationId: string;
  id: string;
  name: string;
  description?: string;
  isSystemRole: boolean; // e.g., 'Owner' cannot be deleted
  rolePermissions: {
    permission: string;
  }[];
  _count: {
    memberships: number;
  };
}

export interface CreateRolePayload {
  name: string;
}

export interface RoleResponse {
  id: string;
  name: string;
  organizationId: string;
}
export interface RolePermissionDetail {
  role: {
    id: string;
    name: string;
  };
  permissions: {
    id: string;
    resource: string; // e.g., "PROJECT"
    action: string; // e.g., "CREATE"
    assignedAt: string;
  }[];
  total: number;
}
export interface Permission {
  id: string;
  action: string;
  resource: string;
}
export interface PermissionImpactDetail {
  id: string;
  action: string;
  resource: string;
  rolePermissions: {
    role: {
      name: string;
      organization: {
        name: string;
        slug: string;
      };
    };
  }[];
  _count: {
    rolePermissions: number;
  };
}

export interface Membership {
  id: string;
  roleId: string;
  userId: string;
  user: {
    name: string;
    email: string;
    image?: string;
  };
  role: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface InvitePayload {
  email: string;
  roleId: string;
  expiresInDays?: number;
}

export interface InvitationResponse {
  id: string;
  email: string;
  role: { name: string };
  organization: { name: string };
  expiresAt: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED";
}
export interface PendingInvitation {
  id: string;
  email: string;
  role: {
    name: string;
  };
  expiresAt: string;
  createdAt: string;
  status: "PENDING" | "EXPIRED";
}
export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
}
export interface Permission {
  id: string;
  action: string;
  resource: string;
}

export interface RoleDetail extends OrganizationRole {
  permissions: Permission[];
  _count: {
    memberships: number;
  };
}
export const organizationService = {
  create: async (data: CreateOrgPayload) => {
    try {
      const response = await api.post("/api/v1/organization", data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create organization",
      );
    }
  },
  getMyOrganizations: async (): Promise<MyOrganization[]> => {
    try {
      const response = await api.get("/api/v1/organization/my");
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to load organizations",
      );
    }
  },
  getOrganizationById: async (orgId: string): Promise<OrganizationDetail> => {
    try {
      const response = await api.get(`/api/v1/organization/${orgId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Unauthorized access to settings",
      );
    }
  },
  getOrganizationStats: async (orgId: string): Promise<OrganizationStats> => {
    try {
      const response = await api.get(`/api/v1/organization/${orgId}/stats`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to load workspace stats",
      );
    }
  },
  getOrganizationRoles: async (orgId: string): Promise<OrganizationRole[]> => {
    try {
      const response = await api.get(`/api/v1/role/${orgId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to load roles");
    }
  },
  createCustomRole: async (
    orgId: string,
    data: CreateRolePayload,
  ): Promise<RoleResponse> => {
    try {
      const response = await api.post(`/api/v1/role/${orgId}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create custom role",
      );
    }
  },
  getRoleById: async (
    orgId: string,
    roleId: string,
  ): Promise<OrganizationRole> => {
    try {
      const response = await api.get(`/api/v1/role/${orgId}/${roleId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to load role details",
      );
    }
  },
  getRolePermissions: async (
    orgId: string,
    roleId: string,
  ): Promise<RolePermissionDetail> => {
    try {
      const response = await api.get(`/api/v1/permission/${orgId}/${roleId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to load role permissions",
      );
    }
  },
  createGlobalPermission: async (data: {
    action: string;
    resource: string;
  }): Promise<Permission> => {
    try {
      const response = await api.post("/api/v1/permission", data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create global permission",
      );
    }
  },
  getPermissionImpact: async (
    permId: string,
  ): Promise<PermissionImpactDetail> => {
    try {
      const response = await api.get(`/api/v1/permission/${permId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch permission impact",
      );
    }
  },
  getMemberships: async (orgId: string): Promise<Membership[]> => {
    try {
      const response = await api.get(`/api/v1/membership/${orgId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to load members",
      );
    }
  },
  sendInvitation: async (
    orgId: string,
    data: InvitePayload,
  ): Promise<InvitationResponse> => {
    try {
      const response = await api.post(`/api/v1/invitation/${orgId}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to send invitation",
      );
    }
  },
  getPendingInvitations: async (
    orgId: string,
  ): Promise<PendingInvitation[]> => {
    try {
      const response = await api.get(`/api/v1/invitation/${orgId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to load pending invitations",
      );
    }
  },
  getMembershipDetail: async (
    orgId: string,
    userId: string,
  ): Promise<Membership> => {
    try {
      const response = await api.get(`/api/v1/membership/${orgId}/${userId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to load member details",
      );
    }
  },
  updateMemberRole: async (
    orgId: string,
    userId: string,
    roleId: string,
  ): Promise<Membership> => {
    try {
      const response = await api.patch(
        `/api/v1/membership/${orgId}/${userId}/role`,
        { roleId },
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update member role",
      );
    }
  },
  revokeInvitation: async (invitationId: string): Promise<void> => {
    try {
      await api.delete(`/api/v1/invitation/${invitationId}/revoke`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to revoke invitation",
      );
    }
  },

  // Add to organizationService object
  updateOrganization: async (
    orgId: string,
    data: { name?: string; slug?: string },
  ): Promise<Organization> => {
    const response = await api.patch(`/api/v1/organization/${orgId}`, data);
    return response.data.data;
  },
  deleteOrganization: async (orgId: string): Promise<void> => {
    await api.delete(`/api/v1/organization/${orgId}`);
  },
  getOrganizationBySlug: async (slug: string): Promise<Organization> => {
    const response = await api.get(`/api/v1/organization/slug/${slug}`);
    return response.data.data;
  },
  // Add to membershipService object
  leaveOrganization: async (orgId: string): Promise<void> => {
    // DELETE /api/v1/memberships/:orgId/leave
    await api.delete(`/api/v1/membership/${orgId}/leave`);
  },
  removeMember: async (orgId: string, userId: string): Promise<void> => {
    // DELETE /api/v1/memberships/:orgId/:userId
    await api.delete(`/api/v1/membership/${orgId}/${userId}`);
  },
  deleteRole: async (orgId: string, roleId: string): Promise<void> => {
    // DELETE /api/v1/roles/:orgId/:roleId
    await api.delete(`/api/v1/role/${orgId}/${roleId}`);
  },
  removePermission: async (
    orgId: string,
    roleId: string,
    permId: string,
  ): Promise<{ removedPermission: any }> => {
    const response = await api.delete(
      `/api/v1/permission/${orgId}/${roleId}/${permId}`,
    );
    return response.data.data;
  },

  // Add to organizationService object
  getRoleDetails: async (
    orgSlug: string,
    roleId: string,
  ): Promise<RoleDetail> => {
    // GET /api/v1/organizations/:orgSlug/roles/:roleId
    const response = await api.get(
      `/api/v1/organization/${orgSlug}/role/${roleId}`,
    );
    return response.data.data;
  },
};
