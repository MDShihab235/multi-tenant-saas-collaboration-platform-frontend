import { create } from "zustand";
import { userService } from "@/services/user.service";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  memberships?: {
    organization: { id: string; name: string; slug: string };
    role: { id: string; name: string };
  }[];
  ownedOrganizations?: { id: string; name: string; slug: string }[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => void;
  fetchAuthMe: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const data = await userService.getMe();
      set({
        user: data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.log(error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  logout: () => {
    // Clear any local storage/cookies if necessary
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  fetchAuthMe: async () => {
    set({ isLoading: true });
    try {
      const data = await userService.getAuthMe();
      const transformedUser: User = {
        ...data,
        memberships: data.memberships?.map((m) => ({
          organization: {
            id: m.organizationId,
            name: m.organization.name,
            slug: m.organization.slug,
          },
          role: {
            id: m.id,
            name: m.role,
          },
        })),
      };
      set({ user: transformedUser, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
