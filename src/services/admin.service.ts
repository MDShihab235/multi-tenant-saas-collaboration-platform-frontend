import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true, // Required for checkAuth() middleware
});

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "BLOCKED" | "INACTIVE";
  role: "USER" | "ADMIN";
  createdAt: string;
  lastLoginAt: string;
}

export interface PaginatedUsers {
  users: UserListItem[];
  totalCount: number;
  totalPages: number;
}
export interface UserDetail extends UserListItem {
  memberships: {
    id: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    organization: {
      id: string;
      name: string;
      slug: string;
      planId: string;
    };
  }[];
}
export interface OrganizationListItem {
  id: string;
  name: string;
  slug: string;
  planId: string;
  _count: {
    memberships: number;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface PaginatedOrganizations {
  organizations: OrganizationListItem[];
  totalCount: number;
  totalPages: number;
}
export interface Permission {
  id: string;
  action: string; // e.g., "create"
  resource: string; // e.g., "user"
  createdAt: string;
}
export interface PlanFeature {
  id: string;
  planId: string;
  name: string;
  description: string | null;
  limitValue: number | null; // null = unlimited
  isEnabled: boolean;
}
export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: "OPEN" | "PAID" | "VOID" | "UNCOLLECTIBLE" | "PAST_DUE";
  dueDate: string;
  createdAt: string;
  subscription: {
    organization: {
      name: string;
    };
  };
}

export interface PaginatedInvoices {
  data: Invoice[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}
export interface PermissionImpact {
  deletedPermission: Permission;
  cascadedRoleAssignments: number; // Count of roles/users affected
}
export interface Plan {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  trialDays: number;
  createdAt: string;
  isActive: boolean;
}

export interface FileItem {
  id: string;
  name: string;
  mimeType: string;
  size: number; // in bytes
  url: string;
  createdAt: string;
  uploader: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PaginatedFiles {
  files: FileItem[];
  totalCount: number;
  totalPages: number;
}

export const adminService = {
  /**
   * GET /api/v1/users?page=1&limit=20&status=ACTIVE&search=john
   */
  getUsers: async (params: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedUsers> => {
    const response = await api.get("/api/v1/user", { params });
    return response.data.data;
  },
  getUserDetail: async (userId: string): Promise<UserDetail> => {
    const response = await api.get(`/api/v1/user/${userId}`);
    return response.data.data;
  },
  updateUserStatus: async (
    userId: string,
    status: "ACTIVE" | "INACTIVE" | "BLOCKED",
  ): Promise<UserListItem> => {
    const response = await api.patch(`/api/v1/user/${userId}/status`, {
      status,
    });
    return response.data.data;
  },
  forcePasswordReset: async (
    userId: string,
  ): Promise<{ id: string; needPasswordChange: boolean }> => {
    const response = await api.patch(`/api/v1/user/${userId}/force-password`);
    return response.data.data;
  },
  hardDeleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/api/v1/user/${userId}`);
  },
  getOrganizations: async (params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<PaginatedOrganizations> => {
    const response = await api.get("/api/v1/organization", { params }); // Matches your route pattern
    return response.data.data;
  },

  // Add to adminService object:
  updatePermission: async (
    permId: string,
    data: { action?: string; resource?: string },
  ): Promise<Permission> => {
    const response = await api.patch(`/api/v1/permission/${permId}`, data);
    return response.data.data;
  },

  // Add to adminService object:
  getPermissionImpact: async (permId: string): Promise<PermissionImpact> => {
    const response = await api.get(`/api/v1/permission/${permId}/impact`);
    return response.data.data;
  },

  deletePermission: async (permId: string): Promise<PermissionImpact> => {
    const response = await api.delete(`/api/v1/permission/${permId}`);
    return response.data.data;
  },
  getPermissions: async (): Promise<Permission[]> => {
    const response = await api.get("/api/v1/permission");
    // Assuming your API wraps the result in a { data: { data: [...] } } structure
    return response.data.data;
  },

  // Add to adminService object
  createPlan: async (data: {
    name: string;
    slug: string;
    priceMonthly: number;
    priceYearly: number;
    currency?: string;
    trialDays?: number;
  }): Promise<Plan> => {
    const response = await api.post("/api/v1/plan", data);
    return response.data.data;
  },

  getPlans: async (): Promise<Plan[]> => {
    const response = await api.get("/api/v1/plan");
    return response.data.data;
  },

  // Add to adminService object
  updatePlan: async (
    planId: string,
    data: {
      name?: string;
      priceMonthly?: number;
      priceYearly?: number;
      trialDays?: number;
    },
  ): Promise<Plan> => {
    const response = await api.patch(`/api/v1/plan/${planId}`, data);
    return response.data.data;
  },

  getPlanDetail: async (planId: string): Promise<Plan> => {
    const response = await api.get(`/api/v1/plan/${planId}`);
    return response.data.data;
  },
  deactivatePlan: async (planId: string): Promise<Plan> => {
    const response = await api.delete(`/api/v1/plan/${planId}`);
    return response.data.data;
  },
  // Add to adminService object
  addPlanFeature: async (
    planId: string,
    data: {
      name: string;
      description?: string;
      limitValue?: number | null;
      isEnabled?: boolean;
    },
  ): Promise<PlanFeature> => {
    const response = await api.post(`/api/v1/plan/${planId}/feature`, data);
    return response.data.data;
  },

  // Add to adminService object
  updatePlanFeature: async (
    planId: string,
    featureId: string,
    data: {
      limitValue?: number | null;
      isEnabled?: boolean;
    },
  ): Promise<PlanFeature> => {
    const response = await api.patch(
      `/api/v1/plan/${planId}/feature/${featureId}`,
      data,
    );
    return response.data.data;
  },
  // Add to adminService object
  deletePlanFeature: async (
    planId: string,
    featureId: string,
  ): Promise<void> => {
    await api.delete(`/api/v1/plan/${planId}/feature/${featureId}`);
  },

  // Add to adminService object
  getInvoices: async (params: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedInvoices> => {
    const response = await api.get("/api/v1/admin/invoice", { params });
    return response.data.data;
  },

  // Add to adminService object
  getFiles: async (params: {
    page: number;
    limit: number;
    mimeType?: string;
  }): Promise<PaginatedFiles> => {
    const response = await api.get("/api/v1/admin/file", { params });
    return response.data.data;
  },
};
