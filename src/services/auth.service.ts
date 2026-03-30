// src/services/auth.service.ts
import axios from "axios";

// Assuming you have an axios instance configured with your base URL.
// If not, we fall back to the standard axios and absolute URL for now.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Crucial for receiving the session cookie from better-auth
});

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}
export interface Session {
  id: string;
  userAgent: string;
  ipAddress: string;
  isCurrent: boolean;
  lastUsedAt: string;
  deviceType: "mobile" | "desktop" | "tablet" | "unknown";
}
export const authService = {
  register: async (data: RegisterPayload) => {
    try {
      // Calls POST /api/v1/auth/register
      const response = await api.post("/api/v1/auth/register", data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to register account",
      );
    }
  },

  login: async (data: LoginPayload) => {
    try {
      // Calls POST /api/v1/auth/login
      const response = await api.post("/api/v1/auth/login", data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Invalid email or password",
      );
    }
  },

  verifyEmail: async (data: VerifyEmailPayload) => {
    try {
      // Calls POST /api/v1/auth/verify-email
      const response = await api.post("/api/v1/auth/verify-email", data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Invalid or expired verification code",
      );
    }
  },
  logout: async () => {
    try {
      // Calls POST /api/v1/auth/logout
      const response = await api.post("/api/v1/auth/logout");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Logout failed");
    }
  },

  // Add to authService object
  getSessions: async (): Promise<Session[]> => {
    const response = await api.get("/api/v1/auth/session");
    return response.data.data;
  },

  revokeSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/api/v1/auth/session/${sessionId}`);
  },
  // Add to authService object
  revokeAllSessions: async (): Promise<{ count: number }> => {
    const response = await api.delete("/api/v1/auth/session");
    return response.data.data;
  },
  deleteAccount: async (): Promise<void> => {
    // This hits the DELETE /api/v1/users/me endpoint
    await api.delete("/api/v1/user/me");
  },
};
