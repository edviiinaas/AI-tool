import type { Metadata } from "next"
import WorkspaceSettingsPageClient from "./WorkspaceSettingsPageClient"

export const metadata: Metadata = {
  title: "Workspace Settings - AIConstruct",
}

export default function WorkspaceSettingsPage() {
  return <WorkspaceSettingsPageClient />
}
