"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Globe, LogOut, Loader2, ImageIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useParams } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { z } from "zod"

const articleSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  imageUrl: z.string().url("Please enter a valid image URL").optional().or(z.literal("")),
})

interface Category {
  id: string
  name: string
  imageUrl: string
}

interface Article {
  id: string
  title: string
  content: string
  imageUrl: string
  categoryId: string
  userId: string
  category: {
    name: string
  }
}

export default function EditArticlePage() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categoryId: "",
    imageUrl: "",
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingArticle, setIsLoadingArticle] = useState(true)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [apiError, setApiError] = useState("")

  const router = useRouter()
  const params = useParams()
  const {
    user,
    logout,
    isAuthenticated,
    articles: articleState,
    categories: categoryState,
    fetchArticleById,
    updateArticle,
    fetchCategories,
    clearArticleError,
  } = useAppStore()

  const { currentArticle: article, isLoading: isLoadingArticleStore } = articleState
  const { categories: categoriesStore, isLoading: isLoadingCategoriesStore } = categoryState
  const articleId = params.id as string

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    fetchArticleById(articleId)
    fetchCategories()
  }, [articleId, isAuthenticated])

  useEffect(() => {
    if (article) {
      // Check if user owns this article
      if (article.userId !== user?.id) {
        router.push("/articles")
        return
      }

      setFormData({
        title: article.title,
        content: article.content,
        categoryId: article.categoryId,
        imageUrl: article.imageUrl,
      })
    }
  }, [article, user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    clearArticleError()

    try {
      // Validate form data
      articleSchema.parse(formData)

      // Use store action to update article
      await updateArticle(articleId, formData)
      router.push(`/articles/${articleId}`)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(fieldErrors)
      }
      // API errors are handled by the store
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }))
    if (errors.categoryId) {
      setErrors((prev) => ({ ...prev, categoryId: "" }))
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              TravelHub
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link href={`/articles/${articleId}`}>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Article
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Image
                src={user?.profilePictureUrl || "/placeholder.svg?height=32&width=32"}
                alt={user?.name || "User"}
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Edit Article</h1>
            <p className="text-gray-600">Update your travel story</p>
          </div>

          {/* Loading State */}
          {isLoadingArticleStore && (
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          )}

          {/* Form */}
          {!isLoadingArticleStore && (
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">Update Your Story</CardTitle>
                <CardDescription className="text-gray-600">Make changes to your travel article</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {apiError && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700">{apiError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="title">Article Title</Label>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      placeholder="Enter an engaging title for your article"
                      value={formData.title}
                      onChange={handleChange}
                      className={`transition-all duration-300 ${errors.title ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
                    />
                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category</Label>
                    <Select value={formData.categoryId} onValueChange={handleCategoryChange}>
                      <SelectTrigger
                        className={`transition-all duration-300 ${errors.categoryId ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingCategoriesStore ? (
                          <SelectItem value="loading" disabled>
                            Loading categories...
                          </SelectItem>
                        ) : (
                          categoriesStore.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Featured Image URL</Label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="imageUrl"
                        name="imageUrl"
                        type="url"
                        placeholder="https://example.com/your-image.jpg"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        className="pl-10 transition-all duration-300 focus:border-blue-500"
                      />
                    </div>
                    {formData.imageUrl && (
                      <div className="mt-2">
                        <Image
                          src={formData.imageUrl || "/placeholder.svg"}
                          alt="Preview"
                          width={400}
                          height={200}
                          className="w-full h-48 object-cover rounded-lg"
                          onError={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Article Content</Label>
                    <Textarea
                      id="content"
                      name="content"
                      placeholder="Write your travel story here..."
                      value={formData.content}
                      onChange={handleChange}
                      rows={12}
                      className={`transition-all duration-300 resize-none ${errors.content ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
                    />
                    {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
                      disabled={isLoadingArticleStore}
                    >
                      {isLoadingArticleStore ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Article"
                      )}
                    </Button>
                    <Link href={`/articles/${articleId}`} className="flex-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full hover:bg-gray-50 transition-colors bg-transparent"
                      >
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
