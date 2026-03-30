import { create } from "zustand";
import { persist } from "zustand/middleware";

interface InfluencerState {
  user: any | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: any, token: string, refreshToken: string) => void;
  logout: () => void;
}

export const useInfluencerStore = create<InfluencerState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user: any, token: string, refreshToken: string) =>
        set({ user, token, refreshToken, isAuthenticated: true }),
      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "influencer-storage",
    }
  )
);
