import type { Metadata } from "next"
import KnowledgePageClient from "./KnowledgePageClient"

export const metadata: Metadata = {
  title: "Knowledge Base - AIConstruct",
}

export default function KnowledgePage() {
  return <KnowledgePageClient />
}
