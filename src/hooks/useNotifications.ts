import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";

export interface Notification {
  id: string;
  title: string;
  message?: string;
  read: boolean;
  createdAt?: string;
  [key: string]: unknown;
}

const fetchNotifications = async (): Promise<Notification[]> => {
  const response = await notificationService.getNotifications();
  return response.data.map((notification) => ({
    ...notification,
    read: (notification as any).read ?? false,
  }));
};

export const useNotifications = () => {
  return useQuery<Notification[], Error>({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    staleTime: 60 * 1000,
    retry: 1,
  });
};
