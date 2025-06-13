import { Agent } from './chat-store'

export const AGENTS: Agent[] = [
  {
    id: 'boq',
    name: 'BOQ Analyzer',
    emoji: '📊',
    description: 'Extracts materials and quantities from BOQs',
    color: 'border-blue-500 bg-blue-50 dark:bg-blue-950'
  },
  {
    id: 'price',
    name: 'Price Prophet',
    emoji: '📈',
    description: 'Predicts prices and market trends',
    color: 'border-green-500 bg-green-50 dark:bg-green-950'
  },
  {
    id: 'supplier',
    name: 'Supplier Scout',
    emoji: '🔍',
    description: 'Finds and compares suppliers',
    color: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
  },
  {
    id: 'advisor',
    name: 'Project Advisor',
    emoji: '🎯',
    description: 'Gives project management advice',
    color: 'border-purple-500 bg-purple-50 dark:bg-purple-950'
  },
  {
    id: 'safety',
    name: 'Safety Inspector',
    emoji: '🦺',
    description: 'Assesses safety risks',
    color: 'border-orange-500 bg-orange-50 dark:bg-orange-950'
  },
  {
    id: 'schedule',
    name: 'Schedule Optimizer',
    emoji: '📅',
    description: 'Optimizes project timelines',
    color: 'border-pink-500 bg-pink-50 dark:bg-pink-950'
  }
]

// Preset combinations of agents for quick selection
export const AGENT_PRESETS = {
  'cost-focus': ['boq', 'price', 'supplier'],
  'safety-focus': ['safety', 'advisor'],
  'planning-focus': ['advisor', 'schedule'],
  'full-analysis': ['boq', 'price', 'supplier', 'advisor', 'safety', 'schedule']
} as const

export type AgentPreset = keyof typeof AGENT_PRESETS

// Mock responses for each agent type
export function getMockAgentResponse(agentId: string, userMessage: string, context?: Record<string, any>) {
  // context: { [agentId]: previousAgentResponse }
  switch (agentId) {
    case "boq":
      return {
        type: "table",
        data: {
          headers: ["Material", "Quantity", "Unit", "Description"],
          rows: [
            ["Concrete", "120", "m³", "C30/37 structural concrete"],
            ["Rebar", "15,000", "kg", "B500B reinforcement steel"],
            ["Formwork", "400", "m²", "Plywood formwork"],
          ],
        },
        summary: "Extracted 3 key materials from the BOQ."
      }
    case "price": {
      const boq = context?.boq
      const material = boq?.data?.rows?.[0]?.[0] || "Concrete"
      return {
        type: "chart",
        data: {
          chartType: "line",
          xKey: "Month",
          yKey: "Price",
          data: [
            { Month: "Jan", Price: 120 },
            { Month: "Feb", Price: 125 },
            { Month: "Mar", Price: 130 },
            { Month: "Apr", Price: 128 },
            { Month: "May", Price: 135 },
          ],
          colors: ["#22c55e"]
        },
        summary: `Price trend for ${material} in 2024. Based on BOQ Analyzer's material list.`
      }
    }
    case "supplier": {
      const boq = context?.boq
      const price = context?.price
      const material = boq?.data?.rows?.[0]?.[0] || "Concrete"
      const priceRange = price ? "from $128/m³ to $130/m³" : "market rates"
      return {
        type: "cards",
        data: [
          {
            name: "BuildCo Ltd.",
            rating: 4.7,
            price: "$128/m³",
            delivery: "3 days",
            contact: "sales@buildco.com"
          },
          {
            name: "Cemex Partners",
            rating: 4.5,
            price: "$130/m³",
            delivery: "5 days",
            contact: "info@cemex.com"
          },
        ],
        summary: `Top suppliers for ${material} (from BOQ, price range ${priceRange} from Price Prophet).`
      }
    }
    case "advisor": {
      const boq = context?.boq
      const price = context?.price
      const supplier = context?.supplier
      return {
        type: "list",
        data: [
          price ? `Consider bulk ordering to reduce cost (see Price Prophet's trend)` : "Consider bulk ordering to reduce cost.",
          supplier ? `Negotiate delivery terms with ${supplier.data?.[0]?.name || 'top supplier'} (see Supplier Scout)` : "Negotiate delivery terms with suppliers.",
          boq ? "Review BOQ for possible material substitutions" : "Review project scope for material substitutions"
        ],
        summary: "Project advice based on BOQ, price, and supplier findings."
      }
    }
    case "safety":
      return {
        type: "timeline",
        data: [
          { phase: "Site Prep", date: "2024-06-01", details: "Ensure fencing and signage are in place." },
          { phase: "Concrete Works", date: "2024-06-10", details: "Mandatory PPE and safety briefings." },
          { phase: "Rebar Installation", date: "2024-06-15", details: "Check for trip hazards and secure storage." },
        ],
        summary: "Safety milestones for upcoming phases."
      }
    case "schedule": {
      const supplier = context?.supplier
      return {
        type: "timeline",
        data: [
          { phase: "Site Prep", date: "2024-06-01", details: "2 days" },
          { phase: "Concrete Works", date: "2024-06-03", details: supplier ? `5 days (delivery by ${supplier.data?.[0]?.name})` : "5 days" },
          { phase: "Rebar Installation", date: "2024-06-08", details: "3 days" },
        ],
        summary: supplier ? "Schedule optimized based on supplier delivery." : "Optimized schedule based on BOQ."
      }
    }
    default:
      return {
        type: "text",
        data: "I'm not sure how to help with that yet."
      }
  }
}

export const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  boq: `You are BOQ Analyzer (📊), a construction AI expert at extracting and summarizing Bill of Quantities (BOQ) documents. Your job is to identify materials, quantities, and descriptions from user input or uploaded documents. Respond with a clear table of materials and a brief summary.`,
  price: `You are Price Prophet (📈), a construction AI specializing in market price analysis and cost trends. Given a list of materials (from BOQ Analyzer), provide recent price trends, market indicators, and cost breakdowns. Reference the BOQ output if available.`,
  supplier: `You are Supplier Scout (🔍), an AI agent that finds and compares suppliers for construction materials. Given a material list and price range, suggest top suppliers with ratings, quotes, and contact info. Reference BOQ and Price Prophet outputs if available.`,
  advisor: `You are Project Advisor (🎯), an AI project management consultant. Given BOQ, price, and supplier info, provide actionable advice, risk assessments, and project tips. Reference other agents' findings as needed.`,
  safety: `You are Safety Inspector (🦺), an AI safety expert for construction projects. Given project plans and timelines, identify safety milestones, required PPE, and risk mitigation steps. Reference other agent outputs if relevant.`,
  schedule: `You are Schedule Optimizer (📅), an AI agent that creates and optimizes construction schedules. Given BOQ, supplier delivery, and project constraints, generate a timeline and highlight critical phases. Reference other agent outputs if relevant.`
} 