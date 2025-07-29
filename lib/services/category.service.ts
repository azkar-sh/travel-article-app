import { apiClient } from "./api"
import type { StrapiResponse, StrapiListResponse } from "@/lib/types/api"
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "@/lib/types/category"

class CategoryService {
  async getCategories(token?: string): Promise<StrapiListResponse<Category>> {
    return apiClient.get<StrapiListResponse<Category>>("/api/categories", token)
  }

  async getCategoryById(documentId: string, token?: string): Promise<StrapiResponse<Category>> {
    return apiClient.get<StrapiResponse<Category>>(`/api/categories/${documentId}`, token)
  }

  async createCategory(categoryData: CreateCategoryRequest, token: string): Promise<StrapiResponse<Category>> {
    const payload = {
      data: categoryData,
    }
    return apiClient.post<StrapiResponse<Category>>("/api/categories", payload, token)
  }

  async updateCategory(
    documentId: string,
    categoryData: UpdateCategoryRequest,
    token: string,
  ): Promise<StrapiResponse<Category>> {
    const payload = {
      data: categoryData,
    }
    return apiClient.put<StrapiResponse<Category>>(`/api/categories/${documentId}`, payload, token)
  }

  async deleteCategory(documentId: string, token: string): Promise<StrapiResponse<any>> {
    return apiClient.delete<StrapiResponse<any>>(`/api/categories/${documentId}`, token)
  }
}

export const categoryService = new CategoryService()
