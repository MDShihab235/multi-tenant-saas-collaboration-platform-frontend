import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
});

export interface CreateOrgPayload {
  name: string;
  slug: string; // URL-friendly version of the name
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
};
