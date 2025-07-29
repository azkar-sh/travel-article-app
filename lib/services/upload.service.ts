import { apiClient } from "./api"

interface UploadResponse {
  id: number
  name: string
  alternativeText: string | null
  caption: string | null
  width: number
  height: number
  formats: any
  hash: string
  ext: string
  mime: string
  size: number
  url: string
  previewUrl: string | null
  provider: string
  provider_metadata: any
  createdAt: string
  updatedAt: string
}

class UploadService {
  async uploadFile(file: File, token: string): Promise<UploadResponse[]> {
    const formData = new FormData()
    formData.append("files", file)

    return apiClient.postFormData<UploadResponse[]>("/api/upload", formData, token)
  }
}

export const uploadService = new UploadService()
