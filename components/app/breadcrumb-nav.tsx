"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Fragment } from "react"

// Helper function to capitalize first letter
function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function BreadcrumbNav() {
  const pathname = usePathname()
  
  // Return null if pathname is null
  if (!pathname) return null
  
  const segments = pathname.split("/").filter(Boolean) // Filter out empty strings

  // Don't show breadcrumbs for the root app page or if no segments
  if (pathname === "/app" || pathname === "/app/" || segments.length <= 1) {
    // Allow breadcrumbs for /app/dashboard, /app/settings etc.
    // but not for just /app if it's the main chat view.
    // If /app is the only segment after splitting (e.g. path is /app), segments[0] is 'app'.
    // We usually want breadcrumbs for pages deeper than the root of a section.
    // This logic might need adjustment based on desired behavior for /app itself.
    // For now, if only "app" segment, or "app" and one more, it's simple.
    // Let's show a default for /app pages that are not the root chat.
    if (segments[0] === "app" && segments.length === 1) return null
  }

  return (
    <div className="hidden md:flex items-center gap-4 px-6 pt-4 pb-2 border-b bg-background">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/app/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {segments.map((segment, index) => {
            // Skip the 'app' segment for display purposes if it's the first one
            if (segment === "app" && index === 0) {
              return null
            }

            const href = "/" + segments.slice(0, index + 1).join("/")
            const isLast = index === segments.length - 1
            // Or if segment is 'app' and it's the first in the list of displayed segments
            const isFirstDisplayedSegment =
              (segments[0] === "app" && index === 1) || (segments[0] !== "app" && index === 0)

            return (
              <Fragment key={href}>
                {(index > 0 || (segments[0] !== "app" && index === 0)) && <BreadcrumbSeparator />}
                {/* Logic to ensure separator is shown correctly after Dashboard if 'app' is skipped */}
                {segments[0] === "app" && index === 1 && <BreadcrumbSeparator />}

                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{capitalizeFirstLetter(segment.replace(/-/g, " "))}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={href}>{capitalizeFirstLetter(segment.replace(/-/g, " "))}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
