"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutGrid,
  Users2,
  BookOpenText,
  MessageSquare,
  Settings,
  LifeBuoy,
  Briefcase,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SideMenuProps {
  isOpen: boolean
}

export function SideMenu({ isOpen }: SideMenuProps) {
  const pathname = usePathname()

  const menuItems = [
    {
      title: "Dashboard",
      href: "/app/dashboard",
      icon: LayoutGrid,
    },
    {
      title: "Team",
      href: "/app/team",
      icon: Users2,
    },
    {
      title: "Knowledge Base",
      href: "/app/knowledge",
      icon: BookOpenText,
    },
    {
      title: "Chat",
      href: "/app/chat",
      icon: MessageSquare,
    },
    {
      title: "Settings",
      href: "/app/settings",
      icon: Settings,
    },
    {
      title: "Help & Support",
      href: "/app/knowledge?tab=support",
      icon: LifeBuoy,
    },
    {
      title: "Workspace",
      href: "/app/workspace",
      icon: Briefcase,
    },
    {
      title: "Billing",
      href: "/app/billing",
      icon: CreditCard,
    },
  ]

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0"
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/app/dashboard" className="flex items-center gap-2 font-semibold">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="text-lg">AIConstruct</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="grid gap-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Button
                key={item.href}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "justify-start",
                  isActive && "bg-muted font-medium"
                )}
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
} 