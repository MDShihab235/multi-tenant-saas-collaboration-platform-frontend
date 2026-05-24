import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true, // Required for checkAuth() middleware
});

export const membershipService = {
  getMembers: async (orgId: string) => {
    const response = await api.get(`/api/v1/membership/${orgId}`);
    return response.data;
  },
  removeMember: async (orgId: string, userId: string) => {
    await api.delete(`/api/v1/membership/${orgId}/${userId}`);
  },
};
