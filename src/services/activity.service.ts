import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true, // Required for checkAuth() middleware
});

export interface ActivityLog {
  id: string;
  action:
    | "created_task"
    | "updated_task"
    | "deleted_task"
    | "member_joined"
    | "comment_added";
  entityName: string; // e.g., "Deploy v2"
  createdAt: string;
  actor: {
    id: string;
    name: string;
    image?: string;
  };
}
export interface ActivityFilter {
  actorId?: string;
  action?: string;
  from?: string; // ISO String
  to?: string; // ISO String
}
export interface ActivityLogDetail extends ActivityLog {
  metadata: Record<string, any>; // The raw JSON payload
}
export const activityService = {
  /**
   * GET /api/v1/activity-logs/:orgId?page=1&limit=20
   */
  getOrgLogs: async (
    orgId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: ActivityLog[];
    meta: { totalPages: number; currentPage: number };
  }> => {
    const response = await api.get(
      `/api/v1/activity-log/${orgId}?page=${page}&limit=${limit}`,
    );
    return response.data.data;
  },
  filterLogs: async (
    orgId: string,
    filters: ActivityFilter,
    page = 1,
  ): Promise<any> => {
    const params = new URLSearchParams({
      page: page.toString(),
      ...(filters.actorId && { actorId: filters.actorId }),
      ...(filters.action && { action: filters.action }),
      ...(filters.from && { from: filters.from }),
      ...(filters.to && { to: filters.to }),
    });

    const response = await api.get(
      `/api/v1/activity-log/${orgId}/filter?${params.toString()}`,
    );
    return response.data.data;
  },
  getLogDetail: async (
    orgId: string,
    logId: string,
  ): Promise<ActivityLogDetail> => {
    const response = await api.get(`/api/v1/activity-log/${orgId}/${logId}`);
    return response.data.data;
  },
  purgeOldLogs: async (
    orgId: string,
    days: number,
  ): Promise<{ deletedCount: number }> => {
    try {
      const response = await api.delete(
        `/api/v1/activity-log/${orgId}/purge?olderThanDays=${days}`,
      );
      return response.data.data;
    } catch (error) {
      throw new Error("Purge authorization failed or server error.");
    }
  },
};
