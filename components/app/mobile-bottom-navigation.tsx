"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageCircle, BookOpenText, Settings, LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/app", label: "Chat", icon: MessageCircle },
  { href: "/app/knowledge", label: "Knowledge", icon: BookOpenText },
  { href: "/app/settings", label: "Settings", icon: Settings },
]

export function MobileBottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            item.href === "/app"
              ? pathname === "/app" || (pathname && pathname.startsWith("/app/chat"))
              : pathname && pathname.startsWith(item.href)
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors",
                isActive && "text-primary",
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
