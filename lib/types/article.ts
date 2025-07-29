// Article related types for Strapi
import type { StrapiEntity } from "./strapi-entity" // Assuming StrapiEntity is declared in another file
import type { Category } from "./category" // Assuming Category is declared in another file
import type { User } from "./user" // Assuming User is declared in another file
import type { Comment } from "./comment" // Assuming Comment is declared in another file

export interface Article extends StrapiEntity {
  title: string
  description: string
  cover_image_url: string
  category?: Category
  user?: User
  comments?: Comment[]
}

export interface CreateArticleRequest {
  title: string
  description: string
  cover_image_url?: string
  category: number // Category ID
}

export interface UpdateArticleRequest {
  title?: string
  description?: string
  cover_image_url?: string
  category?: number // Category ID
}

export interface ArticleFilters {
  page?: number
  pageSize?: number
  populate?: string
  "filters[title][$eqi]"?: string
  "filters[category][name][$eqi]"?: string
}

export interface CreateCommentRequest {
  content: string
  article: number // Article ID
}

export interface UpdateCommentRequest {
  content?: string
}
