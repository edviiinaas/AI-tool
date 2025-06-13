"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import type { User } from "@/lib/types"

export function UserAvatar() {
  const { user } = useAuth()
  const name = user?.fullName || user?.email || "User"
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Avatar>
      <AvatarImage src={user?.avatarUrl} alt={name} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
} 