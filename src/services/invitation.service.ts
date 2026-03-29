import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
});

export interface InvitationDetails {
  valid: boolean;
  invitation?: {
    orgName: string;
    role: string;
    email: string;
    expiresAt: string;
    orgSlug?: string;
  };
}

export const invitationService = {
  verifyInvitation: async (token: string): Promise<InvitationDetails> => {
    try {
      const response = await api.get(`/api/v1/invitation/verify/${token}`);
      return response.data.data;
    } catch (error: any) {
      console.log(error);
      return { valid: false };
    }
  },
  acceptInvitation: async (token: string) => {
    try {
      // This call creates the Membership and updates the Invitation record
      const response = await api.post(
        "/api/v1/invitation/accept",
        { token },
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to join organization",
      );
    }
  },
};
