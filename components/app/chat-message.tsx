"use client"

import React, { useState, useRef, useEffect } from "react"
import type { Message } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Bot, FileText, AlertTriangle, Copy, Check, CheckCheck, Pencil, X, Save, Clock } from "lucide-react"
import { FILE_ICONS, AGENTS } from "@/lib/constants"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChatMessageProps {
  message: Message
  onEditMessage?: (messageId: string, newText: string) => void
  isEditing?: boolean
  onStartEdit?: (messageId: string, currentText: string) => void
  onCancelEdit?: () => void
}

export function ChatMessage({ message, onEditMessage, isEditing, onStartEdit, onCancelEdit }: ChatMessageProps) {
  const isUser = message.sender === "user"
  const isSystem = message.sender === "system"
  const agentDetails = !isUser && !isSystem ? AGENTS.find((a) => a.id === message.sender) : null
  const AgentIcon = agentDetails ? agentDetails.avatar : Bot

  const [copied, setCopied] = useState(false)
  const [editedText, setEditedText] = useState(message.text)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      setEditedText(message.text) // Reset on new edit
      textareaRef.current.focus()
      textareaRef.current.style.height = "auto" // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px` // Set to content
    }
  }, [isEditing, message.text])

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const handleSaveEdit = () => {
    if (onEditMessage && editedText.trim() !== message.text.trim() && editedText.trim() !== "") {
      onEditMessage(message.id, editedText.trim())
    }
    onCancelEdit?.() // Exits editing mode
  }

  const getFileIcon = (fileType?: "pdf" | "excel" | "csv" | "image") => {
    if (!fileType) return FileText
    return FILE_ICONS[fileType] || FileText
  }

  const renderMessageStatus = () => {
    if (!isUser || !message.status) return null
    let icon = <Clock className="h-3 w-3 text-muted-foreground" />
    let tooltipText = "Sending..."

    switch (message.status) {
      case "sent":
        icon = <Check className="h-3.5 w-3.5 text-muted-foreground" />
        tooltipText = "Sent"
        break
      case "delivered":
        icon = <CheckCheck className="h-3.5 w-3.5 text-sky-500" />
        tooltipText = "Delivered"
        break
      case "failed":
        icon = <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
        tooltipText = "Failed to send"
        break
    }
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="mr-1">{icon}</span>
          </TooltipTrigger>
          <TooltipContent side="top" className="p-1.5 text-xs">
            {tooltipText}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (isSystem) {
    return (
      <div className="flex items-center justify-center my-2">
        <div className="text-xs text-muted-foreground italic px-3 py-1 bg-secondary rounded-full flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" />
          {message.text}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("group flex items-start gap-2.5 sm:gap-3 relative", isUser ? "justify-end" : "")}>
      {!isUser && (
        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border">
          {agentDetails ? (
            <AgentIcon className="h-full w-full p-1.5" style={{ color: agentDetails.themeColor }} />
          ) : (
            <Bot className="h-full w-full p-1.5 text-muted-foreground" />
          )}
        </Avatar>
      )}
      <div className={cn("max-w-[75%] flex flex-col", isUser ? "items-end" : "items-start")}>
        {!isUser && agentDetails && (
          <div className="text-xs font-medium mb-0.5" style={{ color: agentDetails.themeColor }}>
            {agentDetails.name}
          </div>
        )}
        <div
          className={cn(
            "rounded-lg p-2.5 sm:p-3 text-sm shadow-sm relative",
            isUser ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground border",
          )}
        >
          {/* Action buttons - appear on hover */}
          <div
            className={cn(
              "absolute top-1 right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150",
              isUser ? "-translate-x-full left-1 right-auto" : "",
              isEditing && "opacity-0 group-hover:opacity-0", // Hide when editing
            )}
          >
            {isUser && onEditMessage && onStartEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-xs p-1 hover:bg-black/10 dark:hover:bg-white/10"
                onClick={() => onStartEdit(message.id, message.text)}
                aria-label="Edit message"
              >
                <Pencil
                  className={cn("h-3.5 w-3.5", isUser ? "text-primary-foreground/70" : "text-card-foreground/70")}
                />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-xs p-1 hover:bg-black/10 dark:hover:bg-white/10"
              onClick={handleCopy}
              aria-label="Copy message"
            >
              {copied ? (
                <Check
                  className={cn("h-3.5 w-3.5", isUser ? "text-primary-foreground/70" : "text-card-foreground/70")}
                />
              ) : (
                <Copy
                  className={cn("h-3.5 w-3.5", isUser ? "text-primary-foreground/70" : "text-card-foreground/70")}
                />
              )}
            </Button>
          </div>

          {message.file && (
            <div className="mb-2 p-2 border rounded-md bg-background/50 flex items-center gap-2">
              {React.createElement(getFileIcon(message.file.type), {
                className: "h-5 w-5 text-muted-foreground",
              })}
              <div>
                <p className="font-medium text-xs">{message.file.name}</p>
                {message.file.size && <p className="text-xs text-muted-foreground">{message.file.size}</p>}
              </div>
            </div>
          )}

          {isEditing && isUser ? (
            <div className="w-full">
              <Textarea
                ref={textareaRef}
                value={editedText}
                onChange={(e) => {
                  setEditedText(e.target.value)
                  e.target.style.height = "auto"
                  e.target.style.height = `${e.target.scrollHeight}px`
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSaveEdit()
                  }
                  if (e.key === "Escape") {
                    onCancelEdit?.()
                  }
                }}
                className="min-h-[40px] w-full text-sm bg-inherit p-0 border-none focus-visible:ring-0 resize-none leading-relaxed"
              />
              <div className="mt-1.5 flex justify-end gap-1.5">
                <Button variant="ghost" size="xs" onClick={onCancelEdit} className="text-xs h-6 px-1.5">
                  <X className="h-3.5 w-3.5 mr-1" /> Cancel
                </Button>
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={handleSaveEdit}
                  disabled={editedText.trim() === "" || editedText.trim() === message.text.trim()}
                  className="text-xs h-6 px-1.5"
                >
                  <Save className="h-3.5 w-3.5 mr-1" /> Save
                </Button>
              </div>
            </div>
          ) : (
            <ReactMarkdown
              className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1"
              components={{
                h1: ({ node, ...props }) => <h1 className="text-xl font-bold my-2" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-lg font-semibold my-1.5" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-md font-medium my-1" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc list-inside my-1 space-y-0.5 pl-1" {...props} />,
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside my-1 space-y-0.5 pl-1" {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a
                    className="text-primary underline hover:text-primary/80"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  />
                ),
              }}
            >
              {message.text}
            </ReactMarkdown>
          )}
        </div>
        <div
          className={cn("text-xs text-muted-foreground mt-1 flex items-center", isUser ? "text-right" : "text-left")}
        >
          {isUser && renderMessageStatus()}
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {isEditing && isUser && <span className="ml-1 text-xs italic">(editing)</span>}
        </div>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border">
          <AvatarImage src={`/placeholder.svg?width=36&height=36&query=U`} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
