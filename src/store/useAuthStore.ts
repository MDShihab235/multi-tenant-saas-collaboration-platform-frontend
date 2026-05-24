import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, token) => set({ user, accessToken: token }),
      logout: () => {
        set({ user: null, accessToken: null });
        // Optional: clear cookies or redirect
        window.location.href = "/login";
      },
    }),
    {
      name: "auth-storage", // Saves to localStorage automatically
    },
  ),
);
