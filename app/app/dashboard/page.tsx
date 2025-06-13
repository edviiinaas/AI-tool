import type { Metadata } from "next"
import DashboardPageClient from "./DashboardPageClient"

export const metadata: Metadata = {
  title: "Dashboard - AIConstruct",
}

export default function DashboardPage() {
  return <DashboardPageClient />
}
