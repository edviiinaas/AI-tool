"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useNotificationSystem } from "@/contexts/notification-settings-context"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface ProfileSettingsFormProps {
  user: any;
  onSave: (data: Partial<any>) => Promise<{ error?: any }>;
}

export function ProfileSettingsForm({ user, onSave }: ProfileSettingsFormProps) {
  const { toast: useToastToast } = useToast()
  const { addNotification } = useNotificationSystem()

  const [fullName, setFullName] = useState(user?.fullName || "")
  const [email, setEmail] = useState(user?.email || "")
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      // Optionally, show preview
      const url = URL.createObjectURL(file)
      setAvatarUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      let newAvatarUrl = avatarUrl
      if (avatarFile) {
        const filePath = `${user?.id}/avatar-${Date.now()}`
        const { data, error } = await supabase.storage.from('avatars').upload(filePath, avatarFile, { upsert: true })
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
        newAvatarUrl = publicUrl
      }
      const { error: metaError } = await onSave({ fullName, avatarUrl: newAvatarUrl })
      if (metaError) throw metaError
      toast.success("Profile updated!")
      addNotification({
        title: "Profile Updated",
        description: "Your profile was updated successfully.",
        eventType: "newFeature",
        href: "/app/settings?tab=profile"
      })
    } catch (err: any) {
      toast.error("Failed to update profile: " + (err.message || "Unknown error"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Update your personal and company details.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-3 sm:flex-row sm:items-start sm:space-x-6 sm:space-y-0">
            <div className="relative group">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || ""} alt={fullName || email} />
                <AvatarFallback className="text-3xl">
                  {(fullName || email || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity"
              >
                Change
                <span className="sr-only">Change profile picture</span>
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
