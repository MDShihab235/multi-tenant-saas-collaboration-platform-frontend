import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
});
export type BillingCycle = "MONTHLY" | "YEARLY";

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: "PAID" | "OPEN" | "VOID" | "UNCOLLECTIBLE";
  hostedInvoiceUrl: string;
  createdAt: string;
}
export interface PaginatedInvoices {
  invoices: Invoice[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface Subscription {
  id: string;
  stripeSubscriptionId: string;
  status: "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "INCOMPLETE";
  billingCycle: "MONTHLY" | "YEARLY";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  cancelAtPeriodEnd: boolean;
  plan: {
    id: string;
    name: string;
    price: number;
    features: string[];
  };
  invoices: Invoice[];
}
export interface UsageMetric {
  used: number;
  limit: number | null; // null = unlimited
}

export interface OrgUsage {
  members: UsageMetric;
  projects: UsageMetric;
  tasks: UsageMetric;
}
export interface InvoiceDetail extends Invoice {
  amountDue: number;
  amountRemaining: number;
  currency: string;
  subtotal: number;
  tax: number;
  paidAt?: string;
  dueDate?: string;
  periodStart: string;
  periodEnd: string;
  subscriptionId: string;
  planName: string;
}
export const subscriptionService = {
  /**
   * POST /api/v1/subscriptions/:orgId/subscribe
   * Initiates a new subscription or trial.
   */
  subscribe: async (
    orgId: string,
    data: { planId: string; billingCycle: BillingCycle },
  ): Promise<Subscription> => {
    const response = await api.post(
      `/api/v1/subscription/${orgId}/subscribe`,
      data,
    );
    return response.data.data;
  },
  getSubscription: async (orgId: string): Promise<Subscription | null> => {
    const response = await api.get(`/api/v1/subscription/${orgId}`);
    return response.data.data;
  },
  getUsage: async (orgId: string): Promise<OrgUsage> => {
    const response = await api.get(`/api/v1/subscription/${orgId}/usage`);
    return response.data.data;
  },
  upgradePlan: async (orgId: string, planId: string): Promise<Subscription> => {
    const response = await api.patch(`/api/v1/subscription/${orgId}/upgrade`, {
      planId,
    });
    return response.data.data;
  },
  downgradePlan: async (
    orgId: string,
    planId: string,
  ): Promise<Subscription> => {
    const response = await api.patch(
      `/api/v1/subscription/${orgId}/downgrade`,
      { planId },
    );
    return response.data.data;
  },
  updateBillingCycle: async (
    orgId: string,
    billingCycle: "MONTHLY" | "YEARLY",
  ): Promise<Subscription> => {
    const response = await api.patch(
      `/api/v1/subscription/${orgId}/billing-cycle`,
      {
        billingCycle,
      },
    );
    return response.data.data;
  },
  cancelSubscription: async (orgId: string): Promise<Subscription> => {
    const response = await api.patch(`/api/v1/subscription/${orgId}/cancel`);
    return response.data.data;
  },
  reactivateSubscription: async (orgId: string): Promise<Subscription> => {
    const response = await api.patch(
      `/api/v1/subscription/${orgId}/reactivate`,
    );
    return response.data.data;
  },
  getInvoices: async (
    orgId: string,
    page: number = 1,
  ): Promise<PaginatedInvoices> => {
    const response = await api.get(`/api/v1/invoice/${orgId}`, {
      params: { page, limit: 10 },
    });
    return response.data.data;
  },
  getInvoiceDetail: async (
    orgId: string,
    invoiceId: string,
  ): Promise<InvoiceDetail> => {
    const response = await api.get(`/api/v1/invoice/${orgId}/${invoiceId}`);
    return response.data.data;
  },
  getInvoicePdfUrl: async (
    orgId: string,
    invoiceId: string,
  ): Promise<string> => {
    const response = await api.get(`/api/v1/invoice/${orgId}/${invoiceId}/pdf`);
    return response.data.data.pdfUrl;
  },
};
