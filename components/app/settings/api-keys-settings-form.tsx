"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, PlusCircle, KeyRound, Copy, Trash2, Eye, EyeOff } from "lucide-react"
import { generateMockId } from "@/lib/utils"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

interface ApiKey {
  id: string
  name: string
  keyPrefix: string // e.g., "aic_pk_..."
  fullKey?: string // Only shown once on creation
  createdAt: string
  lastUsed?: string // Optional
}

// Function to generate a mock API key
const generateMockApiKey = (): string => {
  const prefix = "aic_sk_" // Simulate a secret key
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 32; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return prefix + result
}

export function ApiKeysSettingsForm() {
  const { toast } = useToast()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    // Initial mock key
    {
      id: generateMockId("key"),
      name: "Default Integration Key",
      keyPrefix: "aic_sk_mock_...",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
  ])
  const [isGenerating, setIsGenerating] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [generatedKey, setGeneratedKey] = useState<ApiKey | null>(null)
  const [showRevokeConfirm, setShowRevokeConfirm] = useState<ApiKey | null>(null)
  const [showFullKey, setShowFullKey] = useState(false)

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyName.trim()) {
      toast({
        title: "Key Name Required",
        description: "Please provide a name for your new API key.",
        variant: "destructive",
      })
      return
    }
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

    const fullApiKey = generateMockApiKey()
    const newApiKey: ApiKey = {
      id: generateMockId("key"),
      name: newKeyName,
      keyPrefix: `${fullApiKey.substring(0, 10)}...`, // Show prefix
      fullKey: fullApiKey, // Store full key temporarily to show user
      createdAt: new Date().toISOString(),
    }
    setApiKeys((prev) => [newApiKey, ...prev])
    setGeneratedKey(newApiKey)
    setNewKeyName("")
    setIsGenerating(false)
    setShowFullKey(false) // Reset visibility for new key dialog
  }

  const handleRevokeKey = (keyId: string) => {
    setApiKeys((prev) => prev.filter((key) => key.id !== keyId))
    setShowRevokeConfirm(null)
    toast({ title: "API Key Revoked (Mock)", description: "The API key has been successfully revoked." })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({ title: "Copied to Clipboard", description: "API Key copied successfully." })
      },
      (err) => {
        toast({ title: "Copy Failed", description: "Could not copy API key.", variant: "destructive" })
        console.error("Failed to copy text: ", err)
      },
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage API keys for programmatic access to AIConstruct services. Treat your API keys like passwords.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerateKey} className="flex flex-col sm:flex-row gap-3 mb-6 p-4 border rounded-lg">
            <div className="flex-grow space-y-1.5">
              <Label htmlFor="newKeyName">New API Key Name</Label>
              <Input
                id="newKeyName"
                placeholder="E.g., My Custom Integration"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            <Button type="submit" disabled={isGenerating || !newKeyName.trim()} className="mt-auto sm:self-end h-10">
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <PlusCircle className="mr-2 h-4 w-4" />
              Generate New Key
            </Button>
          </form>

          {apiKeys.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption className="py-4">Your existing API keys.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key Prefix</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isGenerating ? (
                    Array(2).fill(0).map((_, i) => (
                      <TableRow key={`skeleton-key-${i}`}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell className="font-mono text-sm">{key.keyPrefix}</TableCell>
                      <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : "Never"}</TableCell>
                      <TableCell className="text-right flex gap-2 justify-end">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(key.keyPrefix)}
                                aria-label={`Copy API key ${key.name}`}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy key prefix</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive/80"
                                onClick={() => setShowRevokeConfirm(key)}
                                aria-label={`Revoke API key ${key.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Revoke API key</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <KeyRound className="mx-auto h-12 w-12 mb-4" />
              <p>No API keys found.</p>
              <p className="text-sm">Generate a new API key to get started.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6">
          <p className="text-xs text-muted-foreground">
            API keys grant access to your account. Keep them secure and do not share them publicly.
          </p>
        </CardFooter>
      </Card>

      {/* Dialog to show newly generated key */}
      <Dialog open={!!generatedKey} onOpenChange={() => setGeneratedKey(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>API Key Generated Successfully</DialogTitle>
            <DialogDescription>
              Please copy your new API key. You will not be able to see it again after closing this dialog.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="default" className="my-4">
            <KeyRound className="h-4 w-4" />
            <AlertTitle>Important!</AlertTitle>
            <AlertDescription>Store this key securely. It will not be shown again.</AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="generatedKeyValue">API Key for "{generatedKey?.name}"</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="generatedKeyValue"
                readOnly
                value={showFullKey ? generatedKey?.fullKey || "" : "aic_sk_••••••••••••••••••••••••••••••••"}
                className="font-mono flex-grow"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFullKey(!showFullKey)}
                aria-label={showFullKey ? "Hide key" : "Show key"}
              >
                {showFullKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => generatedKey?.fullKey && copyToClipboard(generatedKey.fullKey)}
                disabled={!generatedKey?.fullKey}
                aria-label="Copy API key"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="default" onClick={() => setGeneratedKey(null)}>
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <Dialog open={!!showRevokeConfirm} onOpenChange={() => setShowRevokeConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API Key "{showRevokeConfirm?.name}"?</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this API key? Any applications or services using this key will no longer
              be able to access your account. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (showRevokeConfirm) handleRevokeKey(showRevokeConfirm.id)
              }}
            >
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
