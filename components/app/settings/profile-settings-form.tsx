"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { Camera, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast" // Assuming useToast is available

export function ProfileSettingsForm() {
  const { user, isLoading: authLoading, getCurrentUser, login } = useAuth() // Assuming login can update user details for mock
  const { toast } = useToast()

  const [fullName, setFullName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "")
      setCompanyName(user.companyName || "")
      setEmail(user.email || "")
      // Mock avatar based on email
      setAvatarPreview(`/placeholder.svg?width=96&height=96&query=${user.email.charAt(0)}`)
    }
  }, [user])

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      // In a real app, you'd upload this file.
      toast({
        title: "Profile Picture Updated (Mock)",
        description: `${file.name} selected. In a real app, this would be uploaded.`,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock update user details in AuthContext
    // In a real app, this would be an API call, and AuthContext might refresh user data
    const updatedUser = {
      ...user,
      fullName,
      companyName,
      // email is not editable here
    }
    // This is a hack for mock. Ideally, AuthProvider would have an updateUser method.
    // For now, we'll re-trigger a "login" like action to update the stored user.
    // This is NOT how you'd do it in a real app.
    localStorage.setItem("authUser_aic", JSON.stringify(updatedUser))
    await login(updatedUser.email) // This will re-set user in context and storage

    setIsSubmitting(false)
    toast({
      title: "Profile Updated",
      description: "Your profile information has been successfully updated.",
    })
  }

  if (authLoading && !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal and company details.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
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
