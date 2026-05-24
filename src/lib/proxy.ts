import axios, { AxiosError } from "axios";

// Create configured custom application instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true, // Crucial when authenticating using server cookies/better-auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor to append authorization header dynamically from client storage
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Type definitions matching your application constraints
export interface OrganizationData {
  id: string;
  name: string;
  slug: string;
}

export interface RoleData {
  id: string;
  name: string;
  rolePermissions?: unknown[];
  _count?: {
    memberships: number;
  };
}

// Global API Object Proxy Map Definition
const proxy = {
  organization: {
    getMy: async (): Promise<OrganizationData[]> => {
      const response = await apiClient.get("/organization/my");
      // Unwrap standard baseline service structure { success: true, data: [...] }
      return response.data?.data ?? response.data;
    },
  },
  role: {
    getOrgRoles: async (orgId: string): Promise<RoleData[]> => {
      const response = await apiClient.get(`/organization/${orgId}/roles`);
      return response.data?.data ?? response.data;
    },
    create: async (orgId: string, name: string): Promise<RoleData> => {
      const response = await apiClient.post(`/organization/${orgId}/roles`, {
        name,
      });
      return response.data?.data ?? response.data;
    },
    delete: async (
      orgId: string,
      roleId: string,
    ): Promise<{ success: boolean }> => {
      const response = await apiClient.delete(
        `/organization/${orgId}/roles/${roleId}`,
      );
      return response.data;
    },
  },
};

/**
 * Extracts a user-friendly error message from an intercepted Axios payload.
 */
export function extractError(error: unknown): string {
  if (!error) return "An unexpected error occurred.";

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
    }>;

    // Check custom application server error layout responses
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }

    // Default HTTP Status fallbacks
    if (axiosError.response?.status === 401)
      return "Session expired. Please log in again.";
    if (axiosError.response?.status === 403)
      return "You do not have permission to perform this action.";
    if (axiosError.response?.status === 404)
      return "Requested resource was not found on the server.";

    return axiosError.message || "Network execution pipeline failed.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export default proxy;
