// User related types for Strapi
import type { StrapiEntity } from "./strapi-entity" // Assuming StrapiEntity is declared in another file

export interface User extends StrapiEntity {
  username: string
  email: string
  provider: string
  confirmed: boolean
  blocked: boolean
}

export interface LoginRequest {
  identifier: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  jwt: string
  user: User
}
