"use client"

import Link from "next/link"
import {
  PanelLeftOpen,
  PanelRightOpen,
  Search,
  Settings,
  LogOut,
  User,
  CreditCard,
  Users2,
  BookOpenText,
  Briefcase,
  LifeBuoy,
  Download,
  Sun,
  Moon,
  LayoutGrid,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GlobalSearchDialog } from "./global-search-dialog"
import { NotificationBell } from "./notification-bell"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import { useTheme } from "next-themes"

interface AppHeaderProps {
  onToggleSidebar: () => void
  isSidebarOpen: boolean
  showExportButton?: boolean
  onExportConversation?: () => void
}

export function AppHeader({
  onToggleSidebar,
  isSidebarOpen,
  showExportButton = false,
  onExportConversation,
}: AppHeaderProps) {
  const { user, logout } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const userInitial = user?.fullName
    ? user.fullName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "U"

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="md:hidden">
          {isSidebarOpen ? <PanelRightOpen className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
            {isSidebarOpen ? <PanelLeftOpen className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <Link href="/app/dashboard" className="flex items-center gap-2 font-semibold">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="text-lg">AIConstruct</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
          <Button
            variant="outline"
            className="relative h-9 w-full justify-start rounded-md px-3 text-sm text-muted-foreground sm:w-64 sm:pr-12 md:w-80 lg:w-96"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <span className="ml-6">Search anything...</span>
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          {showExportButton && onExportConversation && (
            <Button variant="outline" size="sm" onClick={onExportConversation} className="hidden sm:flex">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}

          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.avatarUrl || `/placeholder.svg?width=32&height=32&query=${userInitial}`}
                    alt={user?.fullName || user?.email || "User"}
                  />
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.fullName || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/app/dashboard">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/app/settings">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/app/billing">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/app/team">
                    <Users2 className="mr-2 h-4 w-4" />
                    <span>Team</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/app/knowledge">
                    <BookOpenText className="mr-2 h-4 w-4" />
                    <span>Knowledge Base</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/app/workspace">
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>Workspace Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/app/settings?tab=notifications">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>App Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/app/knowledge?tab=support">
                    {" "}
                    {/* Assuming support is a tab or section in knowledge */}
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <GlobalSearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  )
}
