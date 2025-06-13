"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { mockKnowledgeBase } from "@/lib/mock-data"
import {
  FileText,
  FileSpreadsheet,
  FileBarChart2,
  MoreHorizontal,
  Edit,
  Trash2,
  Search,
  UploadCloud,
  BookOpen,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

type KnowledgeArticle = (typeof mockKnowledgeBase)[0]

const fileIcons = {
  pdf: FileText,
  excel: FileSpreadsheet,
  csv: FileBarChart2,
}

const categoryColors: { [key: string]: string } = {
  "Technical Specs": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "Pricing Data": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "Compliance Docs": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  "Project Files": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "Supplier Info": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Other: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
}

function ArticleCard({ article, onRemove }: { article: KnowledgeArticle; onRemove: (id: string) => void }) {
  const Icon = fileIcons[article.fileType as keyof typeof fileIcons] || FileText
  const colorClass = categoryColors[article.category] || categoryColors["Other"]

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader className="flex-row items-start gap-4 pb-4">
        <Icon className="h-8 w-8 text-muted-foreground mt-1" />
        <div className="flex-grow">
          <CardTitle className="text-base leading-tight mb-1">{article.title}</CardTitle>
          <Badge className={`border-transparent ${colorClass}`}>{article.category}</Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onRemove(article.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{article.summary}</p>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground justify-between">
        <span>{article.fileSize}</span>
        <span>Updated: {new Date(article.updatedAt).toLocaleDateString()}</span>
      </CardFooter>
    </Card>
  )
}

export default function KnowledgePageClient() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>(mockKnowledgeBase)
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredArticles = useMemo(() => {
    if (!searchTerm) return articles
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [articles, searchTerm])

  const handleUploadComplete = (newDocument: KnowledgeArticle) => {
    setArticles((prev) => [newDocument, ...prev])
  }

  const handleRemoveArticle = (id: string) => {
    setArticles((prev) => prev.filter((article) => article.id !== id))
    // In a real app, show a toast
  }

  const handleTriggerUploadModal = () => {
    // This is a bit of a workaround as DialogTrigger is usually the one controlling the modal.
    // We'll find the button and click it.
    // A more robust solution might involve managing modal state here.
    const triggerButton = document.getElementById("upload-doc-trigger-btn")
    if (triggerButton) {
      triggerButton.click()
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary dark:text-primary-foreground/90">
            Knowledge Base
          </h1>
          <p className="text-muted-foreground">Manage the documents and data your AI agents use for analysis.</p>
        </div>
        {/* Add an ID to the DialogTrigger's child Button for programmatic click */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button id="upload-doc-trigger-btn" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <UploadCloud className="mr-2 h-4 w-4" /> Upload Document
            </Button>
          </DialogTrigger>
          {/* ... DialogContent remains the same */}
        </Dialog>
      </div>
      <Separator />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search knowledge base..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} onRemove={handleRemoveArticle} />
          ))}
        </div>
      ) : searchTerm ? ( // If there's a search term and no results
        <div className="text-center py-16 text-muted-foreground">
          <Search className="mx-auto h-16 w-16 mb-4 opacity-50" />
          <h2 className="text-xl font-semibold text-foreground">No Results Found</h2>
          <p>Your search for "{searchTerm}" did not match any documents.</p>
          <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2">
            Clear Search
          </Button>
        </div> // If no search term and knowledge base is empty
      ) : (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-lg">
          <BookOpen className="mx-auto h-16 w-16 mb-6 opacity-40 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Your Knowledge Base is Empty</h2>
          <p className="mb-6 max-w-md mx-auto">
            Start building your AI's knowledge by uploading relevant documents. These will be used by your agents to
            provide accurate analyses and insights.
          </p>
          <Button
            onClick={handleTriggerUploadModal}
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <UploadCloud className="mr-2 h-5 w-5" /> Upload Your First Document
          </Button>
        </div>
      )}
    </div>
  )
}
