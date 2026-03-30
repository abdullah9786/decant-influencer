import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useInfluencerStore } from "@/store/useInfluencerStore";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const rawAuthClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise: Promise<string> | null = null;

function skipRefreshForUrl(url: string | undefined): boolean {
  if (!url) return true;
  const paths = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"];
  return paths.some((p) => url.includes(p));
}

export function revokeRefreshOnServer(refreshToken: string | null | undefined) {
  if (!refreshToken) return Promise.resolve();
  return rawAuthClient
    .post("/auth/logout", { refresh_token: refreshToken })
    .catch(() => {});
}

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = useInfluencerStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retryRefresh?: boolean;
    };
    if (!original || original._retryRefresh) return Promise.reject(error);
    if (error.response?.status !== 401) return Promise.reject(error);
    if (skipRefreshForUrl(original.url)) return Promise.reject(error);

    const refresh = useInfluencerStore.getState().refreshToken;
    if (!refresh) {
      useInfluencerStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.assign("/login?session=expired");
      }
      return Promise.reject(error);
    }

    try {
      if (!refreshPromise) {
        refreshPromise = rawAuthClient
          .post("/auth/refresh", { refresh_token: refresh })
          .then((res) => {
            const { access_token, refresh_token, user } = res.data;
            useInfluencerStore.getState().setAuth(user, access_token, refresh_token);
            return access_token as string;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }
      const newAccess = await refreshPromise;
      original.headers = original.headers || {};
      (original.headers as Record<string, string>).Authorization = `Bearer ${newAccess}`;
      original._retryRefresh = true;
      return api(original);
    } catch {
      useInfluencerStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.assign("/login?session=expired");
      }
      return Promise.reject(error);
    }
  }
);

export const authApi = {
  login: (data: any) => api.post("/auth/login", data),
};

export const influencerApi = {
  getProfile: () => api.get("/influencers/me"),
  updateProfile: (data: any) => api.put("/influencers/me", data),

  getSections: () => api.get("/influencers/me/sections"),
  createSection: (data: any) => api.post("/influencers/me/sections", data),
  updateSection: (id: string, data: any) =>
    api.put(`/influencers/me/sections/${id}`, data),
  deleteSection: (id: string) =>
    api.delete(`/influencers/me/sections/${id}`),
  reorderSections: (sectionIds: string[]) =>
    api.put("/influencers/me/sections/reorder", { section_ids: sectionIds }),

  getEarnings: () => api.get("/influencers/me/earnings"),
  getCommissions: (status?: string) =>
    api.get("/influencers/me/commissions", { params: status ? { status_filter: status } : {} }),
};

export const productApi = {
  getAll: (params?: any) => api.get("/products", { params }),
};

export const brandApi = {
  getAll: () => api.get("/brands"),
};

export default api;
