"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Mail, BookOpen, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useProductTour } from "@/components/app/product-tour-provider"

export function HelpPanel() {
  const { startTour } = useProductTour()
  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Help & Support</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h3 className="font-semibold mb-2">Frequently Asked Questions</h3>
          <Accordion type="single" collapsible>
            <AccordionItem value="faq-1">
              <AccordionTrigger>How do I invite my team?</AccordionTrigger>
              <AccordionContent>
                Go to the Team page and click "Invite Member". Enter their email and assign a role.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2">
              <AccordionTrigger>How do I change my subscription?</AccordionTrigger>
              <AccordionContent>
                Visit the Billing page in App Settings to manage your plan and payment method.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-3">
              <AccordionTrigger>Where can I find documentation?</AccordionTrigger>
              <AccordionContent>
                <Link href="/docs" className="text-primary underline">Read the documentation</Link> for detailed guides and API references.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
        <section>
          <h3 className="font-semibold mb-2">Contact Support</h3>
          <p>If you need further help, reach out to our support team:</p>
          <Button asChild variant="outline" className="mb-2">
            <a href="mailto:support@aiconstruct.com"><Mail className="mr-2 h-4 w-4" /> Email Support</a>
          </Button>
        </section>
        <section>
          <h3 className="font-semibold mb-2">Quick Links</h3>
          <div className="flex gap-4 flex-wrap">
            <Button asChild variant="ghost" size="sm">
              <Link href="/docs"><BookOpen className="mr-2 h-4 w-4" /> Docs</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/app/knowledge"><MessageCircle className="mr-2 h-4 w-4" /> Knowledge Base</Link>
            </Button>
          </div>
        </section>
        <section>
          <h3 className="font-semibold mb-2">AI Chatbot (Coming Soon)</h3>
          <p>Get instant answers to your questions with our AI-powered help assistant. (Feature coming soon!)</p>
        </section>
        <section>
          <Button onClick={startTour} variant="default" className="w-full mt-2">
            Start Product Tour
          </Button>
        </section>
      </CardContent>
    </Card>
  )
} 