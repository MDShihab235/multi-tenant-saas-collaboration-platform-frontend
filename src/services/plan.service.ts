import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true, // Required for checkAuth() middleware
});

export interface PlanFeature {
  id: string;
  name: string;
  isAvailable: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceMonthly: number;
  priceYearly: number;
  interval: "month" | "year";
  features: PlanFeature[];
  isPopular?: boolean;
}
export interface CreatePlanPayload {
  name: string;
  slug: string;
  priceMonthly: number;
  priceYearly: number;
  currency?: string;
  trialDays?: number;
}
export interface PlanFeature {
  id: string;
  name: string;
  description?: string;
  isAvailable: boolean;
  value?: string; // e.g., "10GB" or "Unlimited"
}

export const planService = {
  getAllPlans: async (): Promise<Plan[]> => {
    try {
      const response = await api.get("/api/v1/plan");
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch plans");
    }
  },

  createPlan: async (data: CreatePlanPayload) => {
    try {
      const response = await api.post("/api/v1/plan", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to create plan");
    }
  },
  getPlanById: async (planId: string): Promise<Plan> => {
    try {
      const response = await api.get(`/api/v1/plan/${planId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Plan not found");
    }
  },
  getPlanFeatures: async (planId: string): Promise<PlanFeature[]> => {
    try {
      const response = await api.get(`/api/v1/plan/${planId}/features`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch features",
      );
    }
  },
};
