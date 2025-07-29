import { apiClient } from "./api"
import type { User, LoginRequest, RegisterRequest, AuthResponse } from "@/lib/types/user"

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Strapi auth uses form-urlencoded
    const formData = new FormData()
    formData.append("identifier", credentials.identifier)
    formData.append("password", credentials.password)

    return apiClient.postFormData<AuthResponse>("/api/auth/local", formData)
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    // Strapi auth uses form-urlencoded
    const formData = new FormData()
    formData.append("username", userData.username)
    formData.append("email", userData.email)
    formData.append("password", userData.password)

    return apiClient.postFormData<AuthResponse>("/api/auth/local/register", formData)
  }

  async logout(): Promise<void> {
    // Clear any server-side session if needed
    // For now, we just handle client-side logout in the store
  }

  async getCurrentUser(token: string): Promise<User> {
    return apiClient.get<User>("/api/users/me", token)
  }
}

export const authService = new AuthService()
