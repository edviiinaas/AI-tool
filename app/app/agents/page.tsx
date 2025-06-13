import type { Metadata } from "next"
import AgentSettingsPageClient from "./AgentSettingsPageClient"
import { BreadcrumbNav } from "@/components/app/breadcrumb-nav"

export const metadata: Metadata = {
  title: "Agent Settings",
  description: "Customize your AI agents.",
}

export default function AgentSettingsPage() {
  return (
    <>
      <BreadcrumbNav />
      <AgentSettingsPageClient />
    </>
  )
}
