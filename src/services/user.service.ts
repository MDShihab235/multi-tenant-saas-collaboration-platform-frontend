import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
});

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  jobTitle?: string;
  createdAt: string;
}
export interface Role {
  id: string;
  name: string;
  organizationId: string;
  description?: string;
  permissions: string[]; // Array of permission keys
  createdAt: string;
}
export interface AuthMeResponse {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  needPasswordChange: boolean;
  memberships: {
    id: string;
    role: string;
    organizationId: string;
    organization: {
      name: string;
      slug: string;
    };
  }[];
  ownedOrganizations: {
    id: string;
    name: string;
    slug: string;
  }[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | undefined;
  updatedAt: string;
}
export const userService = {
  /**
   * GET /api/v1/users/me
   * Fetches the current user's profile data.
   */
  getMe: async (): Promise<UserProfile> => {
    try {
      const response = await api.get("/api/v1/users/me");
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Session expired");
    }
  },

  /**
   * PATCH /api/v1/users/me
   * Useful for the profile edit form.
   */
  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const response = await api.patch("/api/v1/user/me", data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Update failed");
    }
  },
  getAuthMe: async (): Promise<AuthMeResponse> => {
    try {
      const response = await api.get("/api/v1/auth/me");
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Authentication failed");
    }
  },

  // Add to userService object
  updateMe: async (data: {
    name?: string;
    image?: string;
  }): Promise<UserProfile> => {
    const response = await api.patch("/api/v1/user/me", data);
    return response.data.data;
  },
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    // The backend handles session revocation and sets new Set-Cookie headers
    await api.patch("/api/v1/user/me/change-password", data);
  },

  // Add to roleService object
  updateRole: async (
    orgId: string,
    roleId: string,
    name: string,
  ): Promise<Role> => {
    const response = await api.patch(`/api/v1/role/${orgId}/${roleId}`, {
      name,
    });
    return response.data.data;
  },
  // Add this interface if not already defined

  // Add to userService object
  getRoles: async (orgId: string): Promise<Role[]> => {
    // GET /api/v1/roles/:orgId
    const response = await api.get(`/api/v1/role/${orgId}`);
    return response.data.data;
  },
};
