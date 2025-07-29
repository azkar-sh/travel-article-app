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
import { ArrowLeft, Globe, LogOut, Loader2, ImageIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { articleSchema, type ArticleFormData } from "@/lib/schemas/article.schema"

export default function CreateArticlePage() {
  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    description: "",
    category: 0,
    cover_image_url: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const router = useRouter()
  const {
    user,
    logout,
    isAuthenticated,
    articles: articleState,
    categories: categoryState,
    createArticle,
    fetchCategories,
    clearArticleError,
  } = useAppStore()

  const { isLoading: articleLoading, error: articleError } = articleState
  const { categories, isLoading: categoriesLoading } = categoryState

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    fetchCategories()
  }, [isAuthenticated])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    clearArticleError()

    try {
      // Validate form data
      const validatedData = articleSchema.parse(formData)

      // Use store action to create article
      await createArticle(validatedData)
      router.push("/articles")
    } catch (error) {
      if (error instanceof Error && "errors" in error) {
        const zodError = error as any
        const fieldErrors: Record<string, string> = {}
        zodError.errors?.forEach((err: any) => {
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
    setFormData((prev) => ({ ...prev, category: Number.parseInt(value) }))
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: "" }))
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
            <Link href="/articles">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Articles
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.username}</span>
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
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Create New Article</h1>
            <p className="text-gray-600">Share your travel story with the world</p>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800">Write Your Story</CardTitle>
              <CardDescription className="text-gray-600">
                Fill in the details below to create your travel article
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {articleError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{articleError}</AlertDescription>
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
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category.toString()} onValueChange={handleCategoryChange}>
                    <SelectTrigger
                      className={`transition-all duration-300 ${errors.category ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading categories...
                        </SelectItem>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover_image_url">Cover Image URL (Optional)</Label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="cover_image_url"
                      name="cover_image_url"
                      type="url"
                      placeholder="https://example.com/your-image.jpg"
                      value={formData.cover_image_url}
                      onChange={handleChange}
                      className="pl-10 transition-all duration-300 focus:border-blue-500"
                    />
                  </div>
                  {formData.cover_image_url && (
                    <div className="mt-2">
                      <Image
                        src={formData.cover_image_url || "/placeholder.svg"}
                        alt="Preview"
                        width={400}
                        height={200}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={() => setFormData((prev) => ({ ...prev, cover_image_url: "" }))}
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-500">Add a beautiful image to make your article more engaging</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Article Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Write your travel story here... Share your experiences, tips, and memorable moments."
                    value={formData.description}
                    onChange={handleChange}
                    rows={12}
                    className={`transition-all duration-300 resize-none ${errors.description ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                  <p className="text-sm text-gray-500">Minimum 50 characters. You can use HTML tags for formatting.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
                    disabled={articleLoading}
                  >
                    {articleLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      "Publish Article"
                    )}
                  </Button>
                  <Link href="/articles" className="flex-1">
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
        </div>
      </div>
    </div>
  )
}
