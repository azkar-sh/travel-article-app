"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Calendar,
  Heart,
  Share2,
  Edit,
  Trash2,
  Globe,
  LogOut,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useParams } from "next/navigation"
import { useAppStore } from "@/lib/store"

interface Article {
  id: string
  title: string
  content: string
  imageUrl: string
  categoryId: string
  userId: string
  createdAt: string
  updatedAt: string
  user: {
    name: string
    email: string
    profilePictureUrl: string
  }
  category: {
    name: string
  }
}

export default function ArticleDetailPage() {
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const router = useRouter()
  const params = useParams()
  const {
    user,
    logout,
    isAuthenticated,
    token,
    articles: articleState,
    fetchArticleById,
    deleteArticle,
    clearArticleError,
  } = useAppStore()

  const { currentArticle: article, isLoading, error } = articleState
  const articleId = params.id as string

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    fetchArticleById(articleId)
  }, [articleId, isAuthenticated])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this article?")) return

    try {
      await deleteArticle(articleId)
      router.push("/articles")
    } catch (err) {
      // Error is handled by the store
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : ""
  const shareTitle = article?.title || "Check out this travel article"

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedTitle = encodeURIComponent(shareTitle)

    let shareLink = ""

    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
        break
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
      case "copy":
        navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        return
    }

    if (shareLink) {
      window.open(shareLink, "_blank", "width=600,height=400")
    }
    setShowShareMenu(false)
  }

  const isOwner = user?.id === article?.userId

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
        {/* Error State */}
        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-8" />
            <Skeleton className="h-64 w-full mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        )}

        {/* Article Content */}
        {!isLoading && article && (
          <article className="max-w-4xl mx-auto">
            {/* Article Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-blue-600 text-white">{article.category?.name || "Travel"}</Badge>

                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>

                    {showShareMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                        <div className="p-2 space-y-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-blue-600 hover:bg-blue-50"
                            onClick={() => handleShare("facebook")}
                          >
                            <Facebook className="h-4 w-4 mr-2" />
                            Facebook
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-sky-500 hover:bg-sky-50"
                            onClick={() => handleShare("twitter")}
                          >
                            <Twitter className="h-4 w-4 mr-2" />
                            Twitter
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-blue-700 hover:bg-blue-50"
                            onClick={() => handleShare("linkedin")}
                          >
                            <Linkedin className="h-4 w-4 mr-2" />
                            LinkedIn
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-gray-600 hover:bg-gray-50"
                            onClick={() => handleShare("copy")}
                          >
                            {copied ? (
                              <Check className="h-4 w-4 mr-2 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 mr-2" />
                            )}
                            {copied ? "Copied!" : "Copy Link"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {isOwner && (
                    <div className="flex items-center space-x-2">
                      <Link href={`/articles/${article.id}/edit`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-green-50 hover:border-green-300 transition-colors bg-transparent"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors bg-transparent"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">{article.title}</h1>

              <div className="flex items-center space-x-6 text-gray-600">
                <div className="flex items-center space-x-2">
                  <Image
                    src={article.user?.profilePictureUrl || "/placeholder.svg?height=40&width=40"}
                    alt={article.user?.name || "Author"}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{article.user?.name}</p>
                    <p className="text-sm text-gray-500">{article.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="mb-8">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src={article.imageUrl || "/placeholder.svg?height=500&width=800&query=travel destination"}
                  alt={article.title}
                  width={800}
                  height={500}
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>

            {/* Article Content */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-8">
                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </CardContent>
            </Card>

            {/* Article Actions */}
            <div className="mt-8 flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors bg-transparent"
              >
                <Heart className="h-4 w-4 mr-2" />
                Like Article
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Article
              </Button>
            </div>
          </article>
        )}

        {/* Not Found State */}
        {!isLoading && !article && !error && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Article not found</h3>
              <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
              <Link href="/articles">
                <Button className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 transition-all duration-300">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Articles
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
