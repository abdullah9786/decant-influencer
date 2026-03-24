import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const storage = localStorage.getItem("influencer-storage");
    if (storage) {
      try {
        const parsed = JSON.parse(storage);
        const token = parsed.state.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // ignore
      }
    }
  }
  return config;
});

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
