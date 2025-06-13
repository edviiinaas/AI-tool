"use client"

import { useState } from "react"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, UserPlus } from "lucide-react"
import { mockTeamMembers } from "@/lib/mock-data"
import type { User } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

type TeamMember = User & { role: string; lastActive: string }

const ROLES = ["Admin", "User", "Viewer"]

interface TeamMembersTableProps {
  onInviteClick: () => void
  isLoading?: boolean
}

export function TeamMembersTable({ onInviteClick, isLoading = false }: TeamMembersTableProps) {
  const [members, setMembers] = useState<TeamMember[]>(mockTeamMembers)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<TeamMember | null>(null)

  const filteredMembers = members.filter(
    (member) =>
      member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleRoleChange = (memberId: string, newRole: string) => {
    setMembers(members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)))
    setEditingMember(null)
  }

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter((m) => m.id !== memberId))
    setShowRemoveConfirm(null)
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "destructive"
      case "user":
        return "default"
      case "viewer":
        return "secondary"
      default:
        return "outline"
    }
  }

  const renderSkeletonRows = (count: number) =>
    Array(count)
      .fill(0)
      .map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="h-8 w-8 rounded-md ml-auto" />
          </TableCell>
        </TableRow>
      ))

  return (
    <>
      <div className="mb-4">
        <Input
          placeholder="Search members by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableCaption className="py-4">A list of your team members.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[280px]">Member</TableHead>
                <TableHead className="min-w-[100px]">Role</TableHead>
                <TableHead className="min-w-[150px]">Last Active</TableHead>
                <TableHead className="text-right min-w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                renderSkeletonRows(3)
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={`/placeholder.svg?width=36&height=36&query=${member.fullName?.charAt(0) || member.email.charAt(0)}`}
                            alt={member.fullName || member.email}
                          />
                          <AvatarFallback>{(member.fullName || member.email).charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.fullName || "N/A"}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(member.role)}>{member.role}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{member.lastActive}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setEditingMember(member)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => setShowRemoveConfirm(member)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Image
                        src="/placeholder.svg?width=128&height=128"
                        width={128}
                        height={128}
                        alt="Empty team illustration"
                        className="opacity-50"
                      />
                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold text-foreground">
                          {searchTerm ? "No Members Found" : "Your Crew Awaits!"}
                        </h3>
                        <p className="text-muted-foreground max-w-xs">
                          {searchTerm
                            ? "Try adjusting your search terms to find the team member you're looking for."
                            : "Build your project team by inviting members. Collaboration starts here."}
                        </p>
                      </div>
                      {!searchTerm && (
                        <Button onClick={onInviteClick} className="mt-2">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Invite First Member
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role for {editingMember?.fullName}</DialogTitle>
            <DialogDescription>Select a new role for this team member.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              defaultValue={editingMember?.role}
              onValueChange={(newRole) => {
                if (editingMember) {
                  handleRoleChange(editingMember.id, newRole)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <Dialog open={!!showRemoveConfirm} onOpenChange={() => setShowRemoveConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {showRemoveConfirm?.fullName}?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this member from your team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (showRemoveConfirm) handleRemoveMember(showRemoveConfirm.id)
              }}
            >
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
