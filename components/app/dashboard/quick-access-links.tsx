"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquarePlus, UploadCloud, UserPlus, Settings, FileText, DollarSign } from "lucide-react"

const links = [
  { href: "/app", label: "New Chat", icon: MessageSquarePlus },
  { href: "/app/knowledge", label: "Upload Document", icon: UploadCloud },
  { href: "/app/team", label: "Invite Member", icon: UserPlus },
  { href: "/app/settings", label: "Account Settings", icon: Settings },
  { href: "/app/billing", label: "Billing", icon: DollarSign },
  { href: "/app/knowledge", label: "Knowledge Base", icon: FileText },
]

export function QuickAccessLinks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Access</CardTitle>
        <CardDescription>Jump to common actions and pages.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {links.map((link) => (
          <Button
            key={link.href}
            variant="outline"
            asChild
            className="h-auto py-3 flex flex-col items-center gap-1.5 sm:flex-row sm:justify-start sm:gap-2"
          >
            <Link href={link.href}>
              <link.icon className="h-5 w-5 text-primary" />
              <span className="text-xs sm:text-sm text-center sm:text-left">{link.label}</span>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
