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
      const response = await api.get(`/api/v1/roles/${orgId}`);
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
};
