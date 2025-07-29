import { apiClient } from "./api";
import type { StrapiResponse, StrapiListResponse } from "@/lib/types/api";
import type {
  Article,
  CreateArticleRequest,
  UpdateArticleRequest,
  ArticleFilters,
} from "@/lib/types/article";

class ArticleService {
  async getArticles(
    filters: ArticleFilters = {}
  ): Promise<StrapiListResponse<Article>> {
    const params = new URLSearchParams();

    // Default populate to get related data
    params.append("populate", "*");

    if (filters.page) {
      params.append("pagination[page]", filters.page.toString());
    }
    if (filters.pageSize) {
      params.append("pagination[pageSize]", filters.pageSize.toString());
    }
    if (filters["filters[title][$eqi]"]) {
      params.append("filters[title][$eqi]", filters["filters[title][$eqi]"]);
    }
    if (filters["filters[category][name][$eqi]"]) {
      params.append(
        "filters[category][name][$eqi]",
        filters["filters[category][name][$eqi]"]
      );
    }

    const queryString = params.toString();
    const endpoint = `/api/articles?${queryString}`;

    return apiClient.get<StrapiListResponse<Article>>(endpoint);
  }

  async getArticleById(
    documentId: string,
    token?: string
  ): Promise<StrapiResponse<Article>> {
    return apiClient.get<StrapiResponse<Article>>(
      `/api/articles/${documentId}`,
      token
    );
  }

  async createArticle(
    articleData: CreateArticleRequest,
    token: string
  ): Promise<StrapiResponse<Article>> {
    const payload = {
      data: {
        ...articleData,
        cover_image_url:
          articleData.cover_image_url ||
          "https://via.placeholder.com/800x400?text=Travel+Article",
      },
    };
    return apiClient.post<StrapiResponse<Article>>(
      "/api/articles",
      payload,
      token
    );
  }

  async updateArticle(
    documentId: string,
    articleData: UpdateArticleRequest,
    token: string
  ): Promise<StrapiResponse<Article>> {
    const payload = {
      data: articleData,
    };
    return apiClient.put<StrapiResponse<Article>>(
      `/api/articles/${documentId}`,
      payload,
      token
    );
  }

  async deleteArticle(
    documentId: string,
    token: string
  ): Promise<StrapiResponse<any>> {
    return apiClient.delete<StrapiResponse<any>>(
      `/api/articles/${documentId}`,
      token
    );
  }
}

export const articleService = new ArticleService();
