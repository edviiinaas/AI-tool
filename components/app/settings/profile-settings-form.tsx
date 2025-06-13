"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ProfileSettingsFormProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    companyName: string;
  };
  onSave: (data: Partial<{
    id: string;
    fullName: string;
    email: string;
    companyName: string;
  }>) => void;
}

export function ProfileSettingsForm({ user, onSave }: ProfileSettingsFormProps) {
  const { toast } = useToast()

  const [fullName, setFullName] = useState(user.fullName || "")
  const [companyName, setCompanyName] = useState(user.companyName || "")
  const [email] = useState(user.email || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(`/placeholder.svg?width=96&height=96&query=${user.email.charAt(0)}`)

  useEffect(() => {
    setFullName(user.fullName || "")
    setCompanyName(user.companyName || "")
    // email is not editable
    setAvatarPreview(`/placeholder.svg?width=96&height=96&query=${user.email.charAt(0)}`)
  }, [user])

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      toast({
        title: "Profile Picture Updated (Mock)",
        description: `${file.name} selected. In a real app, this would be uploaded.`,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    onSave({ fullName, companyName })
    setIsSubmitting(false)
    toast({
      title: "Profile Updated",
      description: "Your profile information has been successfully updated.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal and company details.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-3 sm:flex-row sm:items-start sm:space-x-6 sm:space-y-0">
            <div className="relative group">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview || ""} alt={fullName || email} />
                <AvatarFallback className="text-3xl">
                  {(fullName || email || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity"
              >
                <Camera className="h-6 w-6" />
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
            <div className="flex-grow space-y-4 w-full sm:w-auto">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your company's name"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={email} disabled readOnly />
            <p className="text-xs text-muted-foreground">Email address cannot be changed here.</p>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button type="submit" disabled={isSubmitting} className="ml-auto">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
