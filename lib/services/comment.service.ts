import { apiClient } from "./api"
import type { StrapiResponse, StrapiListResponse } from "@/lib/types/api"
import type { Comment, CreateCommentRequest, UpdateCommentRequest } from "@/lib/types/article"

class CommentService {
  async getComments(token?: string): Promise<StrapiListResponse<Comment>> {
    return apiClient.get<StrapiListResponse<Comment>>("/api/comments?populate=*", token)
  }

  async getCommentById(documentId: string, token?: string): Promise<StrapiResponse<Comment>> {
    return apiClient.get<StrapiResponse<Comment>>(`/api/comments/${documentId}?populate=*`, token)
  }

  async createComment(commentData: CreateCommentRequest, token: string): Promise<StrapiResponse<Comment>> {
    const payload = {
      data: commentData,
    }
    return apiClient.post<StrapiResponse<Comment>>("/api/comments", payload, token)
  }

  async updateComment(
    documentId: string,
    commentData: UpdateCommentRequest,
    token: string,
  ): Promise<StrapiResponse<Comment>> {
    const payload = {
      data: commentData,
    }
    return apiClient.put<StrapiResponse<Comment>>(`/api/comments/${documentId}`, payload, token)
  }

  async deleteComment(documentId: string, token: string): Promise<StrapiResponse<any>> {
    return apiClient.delete<StrapiResponse<any>>(`/api/comments/${documentId}`, token)
  }
}

export const commentService = new CommentService()
