"use client" // Add this directive

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function FinalCta() {
  return (
    <section className="w-full py-20 md:py-28 lg:py-32 bg-blue-600 text-white">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
            Ready to Revolutionize Your Construction Workflow?
          </h2>
          <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
            Join hundreds of construction companies already leveraging AI to save time, reduce costs, and make smarter
            decisions. Start your free trial today and experience the future of construction management.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-7 text-lg font-semibold shadow-lg transform hover:scale-105 transition-transform"
          >
            <Link href="/auth/signup">Start Your 14-Day Free Trial</Link>
          </Button>
          <p className="mt-4 text-sm text-blue-200">No credit card required. Cancel anytime.</p>
        </div>
      </div>
    </section>
  )
}
