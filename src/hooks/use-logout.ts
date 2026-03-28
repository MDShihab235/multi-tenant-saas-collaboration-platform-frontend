import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // 1. Clear all TanStack Query caches
      queryClient.clear();

      // 2. Show success message
      toast.success("Logged out", {
        description: "You have been securely signed out.",
      });

      // 3. Redirect to home or login
      router.push("/");
      router.refresh(); // Forces Next.js to re-check server-side auth
    },
    onError: (error: Error) => {
      toast.error("Logout Error", {
        description: error.message,
      });
    },
  });
};
