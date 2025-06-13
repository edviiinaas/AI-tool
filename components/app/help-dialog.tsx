"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LifeBuoy, BookOpen, Mail, Wand2 } from "lucide-react"
import Link from "next/link"

interface HelpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-primary" />
            How can we help?
          </DialogTitle>
          <DialogDescription>Explore our resources or get in touch with our support team.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button variant="outline" className="justify-start h-14" asChild>
            <Link href="/app/knowledge">
              <BookOpen className="mr-4 h-5 w-5" />
              <div className="text-left">
                <p className="font-semibold">Knowledge Base</p>
                <p className="text-xs text-muted-foreground">Find articles and tutorials.</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="justify-start h-14" asChild>
            <a href="mailto:support@aiconstruct.com">
              <Mail className="mr-4 h-5 w-5" />
              <div className="text-left">
                <p className="font-semibold">Contact Support</p>
                <p className="text-xs text-muted-foreground">Get direct help from our team.</p>
              </div>
            </a>
          </Button>
          <Button variant="outline" className="justify-start h-14">
            <Wand2 className="mr-4 h-5 w-5" />
            <div className="text-left">
              <p className="font-semibold">Start Product Tour</p>
              <p className="text-xs text-muted-foreground">Get a guided tour of our features.</p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
