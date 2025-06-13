"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from '@supabase/supabase-js'
import { useChatStore } from '@/lib/chat-store'
import { saveUserPreferences, loadUserPreferences } from '@/lib/supabaseUserPreferences'
import { useAuth } from '@/contexts/auth-context'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function AppSettingsForm() {
  const { user } = useAuth()
  const { agents } = useChatStore()
  const [theme, setTheme] = useState('system')
  const [language, setLanguage] = useState('en')
  const [defaultAgent, setDefaultAgent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPrefs() {
      if (user) {
        setLoading(true)
        const prefs = await loadUserPreferences(user.id)
        setTheme(prefs.theme || 'system')
        setLanguage(prefs.language || 'en')
        setDefaultAgent(prefs.defaultAgent || '')
        setLoading(false)
      } else {
        setTheme(localStorage.getItem('theme') || 'system')
        setLanguage(localStorage.getItem('language') || 'en')
        setDefaultAgent(localStorage.getItem('defaultAgent') || '')
        setLoading(false)
      }
    }
    fetchPrefs()
  }, [user])

  const handleSave = async () => {
    setIsSubmitting(true)
    if (user) {
      await saveUserPreferences(user.id, { theme, language, defaultAgent })
    } else {
      localStorage.setItem('theme', theme)
      localStorage.setItem('language', language)
      localStorage.setItem('defaultAgent', defaultAgent)
    }
    setIsSubmitting(false)
    // Show a toast or feedback here if desired
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>App Settings</CardTitle>
          <CardDescription>Manage your app preferences like theme, language, and default agent.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>App Settings</CardTitle>
        <CardDescription>Manage your app preferences like theme, language, and default agent.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="theme">Theme</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent>Select your preferred app theme.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div>
          <Label htmlFor="language">Language</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent>Select your preferred language.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div>
          <Label htmlFor="defaultAgent">Default Agent</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Select value={defaultAgent} onValueChange={setDefaultAgent}>
                  <SelectTrigger id="defaultAgent">
                    <SelectValue placeholder="Select default agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>{agent.emoji} {agent.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent>Select your default agent for new chats.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
      <CardFooter>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleSave} disabled={isSubmitting} className="ml-auto">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save your app settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  )
} 