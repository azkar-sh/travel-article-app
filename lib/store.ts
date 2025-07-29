import { create } from "zustand"
import { persist } from "zustand/middleware"
import { authService } from "./services/auth.service"
import { articleService } from "./services/article.service"
import { categoryService } from "./services/category.service"
import type { User, LoginRequest, RegisterRequest } from "@/lib/types/user"
import type { Article, ArticleFilters, CreateArticleRequest, UpdateArticleRequest } from "@/lib/types/article"
import type { Category } from "@/lib/types/category"

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface ArticleState {
  articles: Article[]
  currentArticle: Article | null
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  currentPage: number
  totalPages: number
  searchTerm: string
  selectedCategory: string
}

interface CategoryState {
  categories: Category[]
  isLoading: boolean
  error: string | null
}

interface AppState extends AuthState {
  articles: ArticleState
  categories: CategoryState

  // Auth actions
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  clearAuthError: () => void

  // Article actions
  fetchArticles: (filters?: ArticleFilters, append?: boolean) => Promise<void>
  fetchArticleById: (documentId: string) => Promise<void>
  createArticle: (articleData: CreateArticleRequest) => Promise<void>
  updateArticle: (documentId: string, articleData: UpdateArticleRequest) => Promise<void>
  deleteArticle: (documentId: string) => Promise<void>
  setSearchTerm: (term: string) => void
  setSelectedCategory: (categoryId: string) => void
  clearArticleError: () => void
  resetArticles: () => void

  // Category actions
  fetchCategories: () => Promise<void>
  clearCategoryError: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Article state
      articles: {
        articles: [],
        currentArticle: null,
        isLoading: false,
        isLoadingMore: false,
        error: null,
        currentPage: 1,
        totalPages: 1,
        searchTerm: "",
        selectedCategory: "",
      },

      // Category state
      categories: {
        categories: [],
        isLoading: false,
        error: null,
      },

      // Auth actions
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.login(credentials)
          set({
            user: response.user,
            token: response.jwt,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Login failed",
          })
          throw error
        }
      },

      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null })
        try {
          await authService.register(userData)
          set({ isLoading: false, error: null })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Registration failed",
          })
          throw error
        }
      },

      logout: () => {
        authService.logout()
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          articles: {
            articles: [],
            currentArticle: null,
            isLoading: false,
            isLoadingMore: false,
            error: null,
            currentPage: 1,
            totalPages: 1,
            searchTerm: "",
            selectedCategory: "",
          },
        })
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } })
        }
      },

      clearAuthError: () => set({ error: null }),

      // Article actions
      fetchArticles: async (filters: ArticleFilters = {}, append = false) => {
        const state = get()
        const isLoadingMore = append && filters.page && filters.page > 1

        set({
          articles: {
            ...state.articles,
            isLoading: !isLoadingMore,
            isLoadingMore,
            error: null,
          },
        })

        try {
          const response = await articleService.getArticles(filters)
          const newArticles = response.data

          set({
            articles: {
              ...state.articles,
              articles: append ? [...state.articles.articles, ...newArticles] : newArticles,
              currentPage: response.meta.pagination.page,
              totalPages: response.meta.pagination.pageCount,
              isLoading: false,
              isLoadingMore: false,
              error: null,
            },
          })
        } catch (error) {
          set({
            articles: {
              ...state.articles,
              isLoading: false,
              isLoadingMore: false,
              error: error instanceof Error ? error.message : "Failed to fetch articles",
            },
          })
        }
      },

      fetchArticleById: async (documentId: string) => {
        const state = get()
        set({
          articles: {
            ...state.articles,
            isLoading: true,
            error: null,
          },
        })

        try {
          const response = await articleService.getArticleById(documentId, state.token || undefined)
          set({
            articles: {
              ...state.articles,
              currentArticle: response.data,
              isLoading: false,
              error: null,
            },
          })
        } catch (error) {
          set({
            articles: {
              ...state.articles,
              isLoading: false,
              error: error instanceof Error ? error.message : "Failed to fetch article",
            },
          })
        }
      },

      createArticle: async (articleData: CreateArticleRequest) => {
        const state = get()
        const { token } = state

        if (!token) {
          throw new Error("Authentication required")
        }

        set({
          articles: {
            ...state.articles,
            isLoading: true,
            error: null,
          },
        })

        try {
          await articleService.createArticle(articleData, token)
          set({
            articles: {
              ...state.articles,
              isLoading: false,
              error: null,
            },
          })
        } catch (error) {
          set({
            articles: {
              ...state.articles,
              isLoading: false,
              error: error instanceof Error ? error.message : "Failed to create article",
            },
          })
          throw error
        }
      },

      updateArticle: async (documentId: string, articleData: UpdateArticleRequest) => {
        const state = get()
        const { token } = state

        if (!token) {
          throw new Error("Authentication required")
        }

        set({
          articles: {
            ...state.articles,
            isLoading: true,
            error: null,
          },
        })

        try {
          const response = await articleService.updateArticle(documentId, articleData, token)
          set({
            articles: {
              ...state.articles,
              currentArticle: response.data,
              isLoading: false,
              error: null,
            },
          })
        } catch (error) {
          set({
            articles: {
              ...state.articles,
              isLoading: false,
              error: error instanceof Error ? error.message : "Failed to update article",
            },
          })
          throw error
        }
      },

      deleteArticle: async (documentId: string) => {
        const state = get()
        const { token } = state

        if (!token) {
          throw new Error("Authentication required")
        }

        set({
          articles: {
            ...state.articles,
            isLoading: true,
            error: null,
          },
        })

        try {
          await articleService.deleteArticle(documentId, token)
          set({
            articles: {
              ...state.articles,
              articles: state.articles.articles.filter((article) => article.documentId !== documentId),
              isLoading: false,
              error: null,
            },
          })
        } catch (error) {
          set({
            articles: {
              ...state.articles,
              isLoading: false,
              error: error instanceof Error ? error.message : "Failed to delete article",
            },
          })
          throw error
        }
      },

      setSearchTerm: (term: string) => {
        const state = get()
        set({
          articles: {
            ...state.articles,
            searchTerm: term,
          },
        })
      },

      setSelectedCategory: (categoryId: string) => {
        const state = get()
        set({
          articles: {
            ...state.articles,
            selectedCategory: categoryId,
          },
        })
      },

      clearArticleError: () => {
        const state = get()
        set({
          articles: {
            ...state.articles,
            error: null,
          },
        })
      },

      resetArticles: () => {
        const state = get()
        set({
          articles: {
            ...state.articles,
            articles: [],
            currentArticle: null,
            currentPage: 1,
            totalPages: 1,
            searchTerm: "",
            selectedCategory: "",
          },
        })
      },

      // Category actions
      fetchCategories: async () => {
        const state = get()
        set({
          categories: {
            ...state.categories,
            isLoading: true,
            error: null,
          },
        })

        try {
          const response = await categoryService.getCategories(state.token || undefined)
          set({
            categories: {
              categories: response.data,
              isLoading: false,
              error: null,
            },
          })
        } catch (error) {
          set({
            categories: {
              ...state.categories,
              isLoading: false,
              error: error instanceof Error ? error.message : "Failed to fetch categories",
            },
          })
        }
      },

      clearCategoryError: () => {
        const state = get()
        set({
          categories: {
            ...state.categories,
            error: null,
          },
        })
      },
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

// Legacy auth store for backward compatibility
export const useAuthStore = useAppStore
