"use client"

import { useState, useCallback } from "react"
import { UploadCloud, FileText, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"

interface StepProps {
  data: { uploadedDocumentName: string | null }
  updateData: (data: { uploadedDocumentName: string | null }) => void
}

export function DocumentUploadStep({ data, updateData }: StepProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const firstFile = acceptedFiles[0]
        // Basic validation (example: PDF only, max 5MB)
        if (firstFile.type !== "application/pdf") {
          toast.error("Invalid file type. Please upload a PDF.")
          return
        }
        if (firstFile.size > 5 * 1024 * 1024) {
          toast.error("File is too large. Maximum size is 5MB.")
          return
        }
        setFile(firstFile)
        // Simulate upload and update data
        setIsUploading(true)
        setTimeout(() => {
          updateData({ uploadedDocumentName: firstFile.name })
          toast.success(`Mock upload: "${firstFile.name}" ready for processing.`)
          setIsUploading(false)
        }, 1500)
      }
    },
    [updateData],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
  })

  const removeFile = () => {
    setFile(null)
    updateData({ uploadedDocumentName: null })
  }

  return (
    <div className="space-y-6 text-center">
      <h2 className="text-xl font-medium">Power Up Your Agents</h2>
      <p className="text-muted-foreground">
        Upload a sample document (e.g., a VQ, technical specification, or project plan in PDF format). This helps your
        AI agents understand the context of your projects.
      </p>

      {!data.uploadedDocumentName ? (
        <div
          {...getRootProps()}
          className={`mx-auto mt-4 flex h-48 w-full max-w-md cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors
          ${isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground/50"}`}
        >
          <input {...getInputProps()} />
          <UploadCloud className={`mb-2 h-10 w-10 ${isDragActive ? "text-primary" : "text-muted-foreground"}`} />
          {isDragActive ? (
            <p className="font-semibold text-primary">Drop the PDF here...</p>
          ) : (
            <p className="text-muted-foreground">Drag & drop a PDF here, or click to select</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">Max 5MB, PDF only</p>
        </div>
      ) : (
        <div className="mt-4 mx-auto max-w-md p-4 rounded-lg border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">{data.uploadedDocumentName}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={removeFile} aria-label="Remove file">
            <XCircle className="h-5 w-5 text-destructive" />
          </Button>
        </div>
      )}

      {isUploading && <p className="text-sm text-primary">Simulating upload...</p>}

      <Button
        variant="link"
        onClick={() => updateData({ uploadedDocumentName: "skipped_upload.pdf" })} // Simulate skipping
        disabled={!!data.uploadedDocumentName || isUploading}
        className="text-muted-foreground hover:text-primary"
      >
        I'll do this later
      </Button>
    </div>
  )
}
