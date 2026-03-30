import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
});
export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}
export const apiKeyService = {
  /**
   * POST /api/v1/api-keys/:orgId
   */
  generateKey: async (
    orgId: string,
    data: { name: string; expiresAt?: string },
  ): Promise<ApiKey> => {
    const response = await api.post(`/api/v1/api-key/${orgId}`, data);
    return response.data.data;
  },
  getOrgKeys: async (orgId: string): Promise<ApiKey[]> => {
    const response = await api.get(`/api/v1/api-key/${orgId}`);
    return response.data.data;
  },
  getKeyDetail: async (orgId: string, keyId: string): Promise<ApiKey> => {
    const response = await api.get(`/api/v1/api-key/${orgId}/${keyId}`);
    return response.data.data;
  },
  updateKeyMetadata: async (
    orgId: string,
    keyId: string,
    data: { name?: string; expiresAt?: string | null },
  ): Promise<ApiKey> => {
    const response = await api.patch(`/api/v1/api-key/${orgId}/${keyId}`, data);
    return response.data.data;
  },
  rotateKey: async (orgId: string, keyId: string): Promise<ApiKey> => {
    const response = await api.patch(
      `/api/v1/api-key/${orgId}/${keyId}/rotate`,
    );
    return response.data.data;
  },
  deleteKey: async (orgId: string, keyId: string): Promise<void> => {
    try {
      await api.delete(`/api/v1/api-key/${orgId}/${keyId}`);
    } catch (error) {
      throw new Error("Termination Sequence Interrupted: Key remains active.");
    }
  },
};
