import type { User, Invoice } from "./types" // Assuming User type is defined in lib/types.ts
import { generateMockId } from "./utils"

// FIX: Added back mockInvoices export
export const mockInvoices: Invoice[] = [
  {
    id: generateMockId("inv"),
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    amount: 49,
    status: "paid",
  },
  {
    id: generateMockId("inv"),
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    amount: 49,
    status: "paid",
  },
  {
    id: generateMockId("inv"),
    date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    amount: 49,
    status: "paid",
  },
]

export const mockBillingData = {
  currentPlan: {
    name: "Pro Plan",
    price: 49,
    term: "/month",
    features: [
      "Access to All 6 AI Agents",
      "Advanced Document Analysis",
      "Priority Email Support",
      "Unlimited Projects",
      "Collaboration Features (up to 10 users)",
    ],
  },
  nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Approx. 30 days from now
  usage: {
    messages: {
      current: 3247,
      limit: 10000,
      unit: "messages",
    },
    storage: {
      current: 2.4,
      limit: 10,
      unit: "GB",
    },
    projects: {
      current: 12,
      limit: "Unlimited",
      unit: "projects",
    },
    teamSeats: {
      current: 5,
      limit: 10,
      unit: "seats",
    },
  },
  invoiceHistory: mockInvoices, // Use the exported constant
  paymentMethods: [
    {
      id: generateMockId("pm"),
      type: "Visa",
      last4: "4242",
      expiry: "12/2026",
      isPrimary: true,
    },
  ],
}

export const mockTeamMembers: Array<User & { role: string; lastActive: string }> = [
  {
    id: "1",
    email: "john@buildcraft.com",
    role: "Admin",
    lastActive: "2 hours ago",
    companyName: "BuildCraft Inc.",
    fullName: "John Construct",
    plan: "starter",
    onboardingCompleted: true,
  },
  {
    id: "2",
    email: "sarah.e@buildcraft.com",
    role: "User",
    lastActive: "1 day ago",
    companyName: "BuildCraft Inc.",
    fullName: "Sarah Engineer",
    plan: "starter",
    onboardingCompleted: true,
  },
  {
    id: "3",
    email: "mike.p@buildcraft.com",
    role: "User",
    lastActive: "5 hours ago",
    companyName: "BuildCraft Inc.",
    fullName: "Mike Planner",
    plan: "starter",
    onboardingCompleted: true,
  },
  {
    id: "4",
    email: "alice.v@buildcraft.com",
    role: "Viewer",
    lastActive: "3 days ago",
    companyName: "BuildCraft Inc.",
    fullName: "Alice Viewer",
    plan: "starter",
    onboardingCompleted: true,
  },
]

export const mockPendingInvitations = [
  {
    id: generateMockId("invite"),
    email: "new.guy@example.com",
    role: "User",
    invitedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: generateMockId("invite"),
    email: "another.colleague@example.com",
    role: "Viewer",
    invitedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
]

export const mockKnowledgeBase = [
  {
    id: generateMockId("kb"),
    title: "EN 1452 PVC Piping Standards",
    summary:
      "Complete technical specifications for EN 1452 standard PVC piping systems, including material properties and testing procedures.",
    category: "Technical Specs",
    fileType: "pdf",
    fileSize: "2.3MB",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: generateMockId("kb"),
    title: "Q1 2024 Concrete Market Prices",
    summary: "Regional pricing data for C30/37 concrete, including supplier comparisons and bulk discount rates.",
    category: "Pricing Data",
    fileType: "excel",
    fileSize: "850KB",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const mockDashboardStats = {
  activeProjects: 12,
  analysesCompleted: 157,
  teamMembers: mockTeamMembers.length,
  knowledgeDocs: mockKnowledgeBase.length,
}

export const mockRecentActivity = [
  {
    id: generateMockId("act"),
    type: "chat_started",
    description: "John Construct started a new chat: 'Project Alpha VQ'",
    user: "John Construct",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: generateMockId("act"),
    type: "doc_analyzed",
    description: "Magnus completed analysis of 'VQ_Project_Alpha.pdf'",
    user: "Magnus (AI)",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
]

export const mockAgentUsage = [
  { agentName: "Magnus", usageCount: 75, color: "#2563eb" },
  { agentName: "Pricing AI", usageCount: 42, color: "#16a34a" },
  { agentName: "MarketBot", usageCount: 28, color: "#7c3aed" },
  { agentName: "Closing AI", usageCount: 15, color: "#f97316" },
  { agentName: "Compliance AI", usageCount: 33, color: "#dc2626" },
  { agentName: "RiskBot", usageCount: 21, color: "#eab308" },
]
