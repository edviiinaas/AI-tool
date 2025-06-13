"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Paperclip, Send, X, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress" // For progress bar
import { useToast } from "@/components/ui/use-toast" // For error notifications

interface MessageInputProps {
  onSendMessage: (text: string, file?: File) => void
  isSending: boolean
}

const MAX_FILE_SIZE_MB = 5
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/gif",
]
const MAX_TOKENS = 4000 // Example token limit

export function MessageInput({ onSendMessage, isSending }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const currentTokens = Math.round(message.length / 4) // Rough estimation

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setFile(null)
    setFileError(null)
    setUploadProgress(0)
  }

  const handleSend = useCallback(() => {
    if ((message.trim() === "" && !file) || isSending || fileError) return

    if (file) {
      // Start mock progress
      setUploadProgress(0)
      let currentProgress = 0
      const interval = setInterval(() => {
        currentProgress += 10
        if (currentProgress <= 100) {
          setUploadProgress(currentProgress)
        } else {
          clearInterval(interval)
          onSendMessage(message.trim(), file || undefined)
          setMessage("")
          resetFileInput()
        }
      }, 100) // Adjust speed of mock progress
    } else {
      onSendMessage(message.trim(), file || undefined)
      setMessage("")
      resetFileInput()
    }
  }, [message, file, isSending, onSendMessage, fileError, toast])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null) // Reset error on new file selection
    setUploadProgress(0) // Reset progress

    const selectedFile = event.target.files && event.target.files[0]
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        setFileError(`File is too large. Max size: ${MAX_FILE_SIZE_MB}MB.`)
        toast({
          title: "Upload Error",
          description: `File "${selectedFile.name}" is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
          variant: "destructive",
        })
        resetFileInput()
        return
      }
      if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
        const friendlyFileType = selectedFile.name.split(".").pop()?.toUpperCase() || "Unknown type"
        setFileError(`Invalid file type: ${friendlyFileType}. Allowed: PDF, Excel, CSV, PNG, JPG, GIF.`)
        toast({
          title: "Upload Error",
          description: `File type "${friendlyFileType}" for "${selectedFile.name}" is not supported.`,
          variant: "destructive",
        })
        resetFileInput()
        return
      }
      setFile(selectedFile)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  // Show progress bar only when a file is selected and message is being sent (mocked by isSending and uploadProgress > 0)
  const showProgressBar = file && isSending && uploadProgress > 0

  return (
    <div className="sticky bottom-0 bg-background p-3 sm:p-4 border-t">
      {file && !fileError && (
        <div className="mb-2 p-2 border rounded-md bg-muted/50 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 truncate">
            <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate" title={file.name}>
              {file.name}
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              ({(file.size / 1024).toFixed(1)} KB)
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => {
              resetFileInput()
            }}
            disabled={isSending && uploadProgress > 0}
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {fileError && (
        <div className="mb-2 p-2 border border-destructive/50 rounded-md bg-destructive/10 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="truncate" title={fileError}>
            {fileError}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-destructive hover:text-destructive/80 ml-auto"
            onClick={() => {
              resetFileInput()
            }}
            aria-label="Clear error and file"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
      {showProgressBar && (
        <div className="mb-2">
          <Progress value={uploadProgress} className="h-1.5 w-full" />
          <p className="text-xs text-muted-foreground mt-0.5 text-center">
            Uploading {file?.name}... {uploadProgress}%
          </p>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="relative flex items-end gap-2"
      >
        <Textarea
          placeholder="Type your message or drop a file..."
          className="min-h-[48px] resize-none pr-[100px] sm:pr-[110px] py-2.5 leading-relaxed"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending || !!fileError}
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = "inherit"
            target.style.height = `${target.scrollHeight}px`
          }}
        />
        <div className="absolute right-2 bottom-[9px] flex items-center gap-1 sm:gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending || !!fileError}
                  className="h-8 w-8 sm:h-9 sm:w-9"
                >
                  <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="sr-only">Attach file</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="p-1.5 text-xs">
                Attach PDF, Excel, CSV, Image (Max {MAX_FILE_SIZE_MB}MB)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept={ALLOWED_FILE_TYPES.join(",")}
            disabled={isSending || !!fileError}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  size="icon"
                  disabled={isSending || (message.trim() === "" && !file) || !!fileError}
                  className="h-8 w-8 sm:h-9 sm:w-9 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="sr-only">Send</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="p-1.5 text-xs">
                Send message (Enter)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </form>
      <div className="text-xs text-muted-foreground mt-1.5 text-right">
        {currentTokens} / {MAX_TOKENS} tokens
      </div>
    </div>
  )
}
