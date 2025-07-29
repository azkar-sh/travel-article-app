import { z } from "zod"

// Article schemas for Strapi
export const articleSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  category: z.number().min(1, "Please select a category"),
  cover_image_url: z.string().url("Please enter a valid image URL").optional().or(z.literal("")),
})

export const createArticleSchema = articleSchema

export const updateArticleSchema = articleSchema

export type ArticleFormData = z.infer<typeof articleSchema>
export type CreateArticleFormData = z.infer<typeof createArticleSchema>
export type UpdateArticleFormData = z.infer<typeof updateArticleSchema>
