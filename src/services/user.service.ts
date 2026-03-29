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
};
