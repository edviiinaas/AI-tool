import type { Metadata } from "next"
import TeamPageClient from "./TeamPageClient"

export const metadata: Metadata = {
  title: "Team Management - AIConstruct",
}

export default function TeamPage() {
  return <TeamPageClient />
}
