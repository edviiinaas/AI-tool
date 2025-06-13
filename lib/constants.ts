// FIX: Changed APP_LOGO to be a component to fix deployment error.
// UPDATED: All constants updated to match the new homepage design brief.
// ADDED: FAQ_ITEMS constant
import {
  Bot,
  HardHat,
  Calculator,
  BarChart3,
  Handshake,
  ShieldCheck,
  AlertTriangle,
  UploadCloud,
  CheckCircle,
  MessageSquare,
  FileText,
  FileSpreadsheet,
  FileBarChart,
  FileQuestion,
} from "lucide-react"
import type { Feature, HowItWorksStep, PricingTier, Testimonial, NotificationPreference } from "./types"

export const APP_NAME = "AIConstruct"
export const APP_LOGO = Bot

export const LANDING_FEATURES: Feature[] = [
  {
    icon: HardHat,
    title: "Magnus",
    subtitle: "Technical GQ Analyzer",
    description: "Scans VQs, identifies missing specs, validates scope.",
  },
  {
    icon: Calculator,
    title: "Pricing AI",
    subtitle: "Market Price Expert",
    description: "Estimates fair market rates and flags pricing inconsistencies.",
  },
  {
    icon: BarChart3,
    title: "MarketBot",
    subtitle: "Competitive Intelligence",
    description: "Analyzes competitor proposals and bid patterns.",
  },
  {
    icon: Handshake,
    title: "Closing AI",
    subtitle: "Sales Strategist",
    description: "Suggests win themes, proposal messaging, and upsell angles.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance AI",
    subtitle: "Regulatory Checker",
    description: "Ensures project compliance with industry standards.",
  },
  {
    icon: AlertTriangle,
    title: "RiskBot",
    subtitle: "Risk Assessor",
    description: "Flags timeline, financial, and supply chain risks proactively.",
  },
]

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    icon: UploadCloud,
    title: "1. Upload Your Documents",
    description: "Securely upload tenders, VQs, drawings, or cost sheets (PDF, Excel, CSV).",
  },
  {
    icon: CheckCircle,
    title: "2. Choose Your AI Assistants",
    description: "Select agents based on your workflow: technical, pricing, or compliance.",
  },
  {
    icon: MessageSquare,
    title: "3. Get Instant Insights",
    description: "Receive structured output, recommendations, reports, and export-ready summaries.",
  },
]

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: "€9.90",
    pricePeriod: "/user/month",
    description: "For freelancers and small teams getting started.",
    features: ["2 AI agents", "Basic document analysis", "5 projects/month", "Email support"],
    buttonText: "Start Free Trial",
    isFeatured: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "€49",
    pricePeriod: "/user/month",
    description: "For growing businesses that need more power and collaboration.",
    features: ["All 6 agents", "Unlimited projects", "Priority support", "Collaboration features"],
    buttonText: "Get Started",
    isFeatured: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    pricePeriod: "",
    description: "For large organizations with specific needs.",
    features: ["Everything in Pro", "Unlimited users", "Dedicated account manager", "API access & agent training"],
    buttonText: "Contact Sales",
    isFeatured: false,
  },
]

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "John Carter",
    title: "Lead Engineer, ConstructX",
    quote: "AIConstruct revolutionized our bidding process. Magnus alone saved us 12 hours per tender.",
    avatar: "/placeholder.svg?width=40&height=40",
  },
  {
    name: "Sarah Miller",
    title: "Commercial Director, BuildWell",
    quote: "Pricing AI helped us cut proposal prep time in half. We never go back to Excel.",
    avatar: "/placeholder.svg?width=40&height=40",
  },
  {
    name: "David Lee",
    title: "Project Manager, InfraPro",
    quote: "Compliance AI eliminated 80% of our QA issues. That's real ROI.",
    avatar: "/placeholder.svg?width=40&height=40",
  },
]

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreference[] = [
  {
    eventType: "agentResponse",
    label: "New Agent Response",
    allowedChannels: ["inApp", "desktop"],
    enabledChannels: ["inApp", "desktop"],
  },
  {
    eventType: "docAnalysisComplete",
    label: "Document Analysis Complete",
    allowedChannels: ["inApp", "desktop", "email"],
    enabledChannels: ["inApp", "desktop"],
  },
  {
    eventType: "teamInviteAccepted",
    label: "Team Member Joined",
    allowedChannels: ["inApp", "email"],
    enabledChannels: ["inApp", "email"],
  },
  {
    eventType: "billingSuccess",
    label: "Billing Update",
    allowedChannels: ["inApp", "email"],
    enabledChannels: ["inApp", "email"],
  },
  {
    eventType: "newFeature",
    label: "New Feature Announcement",
    allowedChannels: ["inApp"],
    enabledChannels: ["inApp"],
  },
  {
    eventType: "taskMention",
    label: "Task Mention or Assignment",
    allowedChannels: ["inApp", "desktop", "email"],
    enabledChannels: ["inApp", "desktop"],
  },
]

export const AGENTS = [
  { 
    id: "magnus" as const, 
    name: "Magnus", 
    description: "Technical GQ Analyzer",
    icon: HardHat, 
    color: "blue-500" 
  },
  { 
    id: "pricing-ai" as const, 
    name: "Pricing AI", 
    description: "Market Price Expert",
    icon: Calculator, 
    color: "green-500" 
  },
  { 
    id: "market-bot" as const, 
    name: "MarketBot", 
    description: "Competitive Intelligence",
    icon: BarChart3, 
    color: "purple-500" 
  },
  { 
    id: "closing-ai" as const, 
    name: "Closing AI", 
    description: "Sales Strategist",
    icon: Handshake, 
    color: "orange-500" 
  },
  { 
    id: "compliance-ai" as const, 
    name: "Compliance AI", 
    description: "Regulatory Checker",
    icon: ShieldCheck, 
    color: "red-500" 
  },
  { 
    id: "risk-bot" as const, 
    name: "RiskBot", 
    description: "Risk Assessor",
    icon: AlertTriangle, 
    color: "yellow-500" 
  }
]

export const FILE_ICONS = {
  pdf: FileText,
  excel: FileSpreadsheet,
  csv: FileBarChart,
  default: FileQuestion,
}

export const DEFAULT_AGENT_CONFIGS = AGENTS.map((agent) => ({
  agentId: agent.id,
  name: agent.name,
  plan: "starter",
  masterPrompt: `This is ${agent.name}. I am an AI assistant specialized in ${agent.description.toLowerCase()}.`,
  temperature: 0.5,
  responseStyle: "balanced" as const,
  tokenLimit: 2000,
  knowledgeDocumentIds: [],
  isEnabled: true
}))

export const MOCK_KNOWLEDGE_DOCS = [
  { 
    id: "kb_doc_1", 
    name: "EN_1991-1-4_Wind_Actions.pdf", 
    type: "pdf" as const,
    size: "2.5MB",
    uploadedAt: new Date(),
    status: "ready" as const
  },
  { 
    id: "kb_doc_2", 
    name: "Concrete_Mix_Specifications.xlsx", 
    type: "csv" as const,
    size: "1.8MB",
    uploadedAt: new Date(),
    status: "ready" as const
  }
]

// Added FAQ_ITEMS
export const FAQ_ITEMS = [
  {
    id: "faq1",
    question: "What types of documents can AIConstruct analyze?",
    answer:
      "AIConstruct can analyze a wide range of construction documents including tenders, Bills of Quantities (BoQs/VQs), drawings, specifications, cost sheets, and compliance checklists. Supported formats include PDF, Excel (XLSX, XLS), and CSV.",
  },
  {
    id: "faq2",
    question: "How does AIConstruct ensure data security?",
    answer:
      "We take data security very seriously. All documents are encrypted in transit and at rest. We utilize secure cloud infrastructure and implement strict access controls. We are compliant with industry-standard security practices. You retain full ownership of your data.",
  },
  {
    id: "faq3",
    question: "Can I customize the AI agents?",
    answer:
      "Yes, on our Pro and Enterprise plans, you can customize agent behavior, including their master prompts, response styles, and even train them on your company-specific documents and historical data for more tailored insights.",
  },
  {
    id: "faq4",
    question: "Is there a free trial available?",
    answer:
      "Yes, we offer a 14-day free trial for our Starter plan, no credit card required. This allows you to test out our core features and see how AIConstruct can benefit your team.",
  },
  {
    id: "faq5",
    question: "What kind of support do you offer?",
    answer:
      "All plans include email support. Pro plan users receive priority email support, and Enterprise plan users have a dedicated account manager and direct support channels.",
  },
]
