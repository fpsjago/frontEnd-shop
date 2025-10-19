import { apiClient } from "../lib/api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user?: {
    id: string;
    name?: string;
    email: string;
    role?: string;
  };
}

export const authService = {
  /**
   * Authenticate against the upstream API and return the issued JWT + user payload.
   * Side effects (like setting cookies) are handled by callers so this method is reusable.
   */
  async login(payload: LoginPayload) {
    const response = await apiClient.post<AuthResponse>("/login", payload);
    console.log("[authService] /login response:", response);
    return response;
  },
  logout() {
    return apiClient.post<void>("/logout");
  },
  getProfile() {
    return apiClient.get<AuthResponse["user"]>("/auth/me");
  },
};
