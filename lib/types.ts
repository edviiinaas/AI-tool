import type React from "react"
import type { LucideIcon } from "lucide-react"

// Database Types and Interfaces

export type PlanType = "starter" | "pro" | "enterprise"
export type MessageRole = "user" | "assistant" // Kept for simplicity, sender determines actual source
export type AgentSlug = "magnus" | "pricing-ai" | "market-bot" | "closing-ai" | "compliance-ai" | "risk-bot" // From constants

export interface User {
  id: string
  email: string
  fullName?: string
  companyName?: string // Added for onboarding/workspace context
  plan: PlanType // User's current plan
  onboardingCompleted: boolean
  avatarUrl?: string // Optional avatar URL for user profile images
  // Supabase User object might have more fields like 'created_at', 'updated_at'
  // For this app, we primarily care about id and email for identification.
  // Other details might come from a separate 'profiles' table in Supabase.
}

export interface Workspace {
  id: string
  name: string
  ownerId: string // User ID of the owner
  plan: PlanType
  createdAt: Date
  updatedAt: Date
  // other workspace-specific settings
}

// Agent definition is now primarily in constants.ts for the frontend
// If agents were configurable from a DB, this interface would be more relevant.
export interface AgentConfig {
  id: AgentSlug // Matches Agent['id'] from constants
  name: string // Denormalized from AGENTS constant for convenience
  description: string // Denormalized
  icon: React.ElementType // Denormalized
  color: string // Denormalized
  masterPrompt: string
  temperature: number // e.g., 0.0 to 1.0
  responseStyle: "concise" | "detailed" | "balanced"
  tokenLimit: number // Max tokens per response
  // agent-specific knowledge document IDs could be stored here
  knowledgeDocumentIds?: string[]
  isEnabled: boolean // Whether the user has this agent active
}

export interface Conversation {
  id: string
  userId: string // ID of the user who owns/created this conversation
  title: string
  createdAt: Date
  updatedAt: Date
  activeAgentIds: string[] // Array of Agent IDs (e.g., "magnus", "pricing-ai")
  messages: Message[]
  // workspaceId?: string; // If conversations are tied to workspaces
}

export interface MessageFile {
  name: string
  type: "pdf" | "excel" | "csv" | "image" // Added image
  size?: string // e.g., "1.2 MB"
  url?: string // Optional: for direct link or preview
}

export type MessageSender = "user" | "system" | "assistant" | "agent"

export interface Message {
  id: string
  sender: MessageSender
  text: string
  timestamp: Date
  file?: MessageFile
  status?: "sending" | "sent" | "delivered" | "failed" // For user messages
  // agentDetails?: Agent; // If we need to store the specific agent snapshot that sent the message
}

export interface KnowledgeDocument {
  id: string
  name: string
  type: "pdf" | "csv" | "txt" | "docx"
  size: string // e.g., "2.5MB"
  uploadedAt: Date
  status: "processing" | "ready" | "error"
  summary?: string // Optional AI-generated summary
  associatedAgents?: string[] // Agent IDs this doc is linked to
}

export interface TeamMember {
  id: string
  userId: string // Link to User table
  workspaceId: string
  role: "admin" | "member" | "viewer"
  name: string // Denormalized for easy display
  email: string // Denormalized
  status: "active" | "pending_invitation"
  invitedAt?: Date
  joinedAt?: Date
}

// For pricing page
export interface PricingTier {
  id: PlanType
  name: string
  price: string
  pricePeriod: string
  description: string
  features: string[]
  buttonText: string
  isFeatured: boolean
}

// For onboarding
export interface OnboardingStep {
  id: number
  name: string
  fields?: { name: string; label: string; type: string; required?: boolean }[]
}

// Notification System Types
export type NotificationChannel = "inApp" | "email" | "desktop"
export type NotificationEventType =
  | "agentResponse"
  | "docAnalysisComplete"
  | "teamInviteAccepted"
  | "billingSuccess"
  | "newFeature"
  | "taskMention" // Example: if tasks/mentions were a feature

export interface NotificationPreference {
  eventType: NotificationEventType
  label: string // User-friendly label for the event type
  allowedChannels: NotificationChannel[] // Channels this event type supports
  enabledChannels: NotificationChannel[] // Channels user has enabled
}

export interface AppNotification {
  id: string
  title: string
  description: string
  timestamp: Date
  read: boolean
  eventType: NotificationEventType
  href?: string
  icon?: React.ElementType // Lucide icon component
}

export interface Feature {
  icon: LucideIcon
  title: string
  subtitle?: string
  description: string
}

export interface HowItWorksStep {
  icon: LucideIcon
  title: string
  description: string
}

export interface Testimonial {
  name: string
  title: string
  quote: string
  avatar: string
}

export interface Invoice {
  id: string;
  date: string; // or Date
  amount: number;
  status: "paid" | "unpaid" | "overdue";
  // Add any other fields as needed
}
